import React, { useState, useEffect } from 'react'
import { Search, Plus, FileText, Calendar, Users, Building, Loader2, Wifi, WifiOff, Home, ArrowLeft } from 'lucide-react'
import { getDatosCompletos, crearParteTrabajo, checkConnectivity, retryOperation } from './services/notionService'
import './App.css'

function App() {
	const [activeSection, setActiveSection] = useState('consulta')
	const [datos, setDatos] = useState({
		obras: [],
		jefesObra: [],
		empleados: [],
		partesTrabajo: []
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [connectivity, setConnectivity] = useState({ status: 'checking', message: '' })

	// Cargar datos de Notion al iniciar la aplicación
	useEffect(() => {
		cargarDatos()
	}, [])

	const cargarDatos = async () => {
		try {
			setLoading(true)
			setError(null)
			setConnectivity({ status: 'checking', message: 'Verificando conectividad...' })

			// Verificar conectividad primero
			const connectivityCheck = await checkConnectivity()
			setConnectivity({
				status: connectivityCheck.status,
				message: connectivityCheck.status === 'ok' ? 'Conectado' : connectivityCheck.message
			})

			if (connectivityCheck.status === 'error') {
				throw new Error(`Problema de conectividad: ${connectivityCheck.message}`)
			}

			// Cargar datos con reintentos
			const datosCompletos = await retryOperation(async () => {
				return await getDatosCompletos()
			}, 3, 1000)

			console.log('📊 Datos cargados:', datosCompletos)
			console.log('🏗️ Obras cargadas:', datosCompletos.obras.length)
			console.log('👥 Empleados cargados:', datosCompletos.empleados.length)
			console.log('👨‍💼 Jefes de obra cargados:', datosCompletos.jefesObra.length)

			setDatos(datosCompletos)
			setConnectivity({ status: 'ok', message: 'Conectado' })
		} catch (err) {
			console.error('Error al cargar datos:', err)
			setError(err.message)
			setConnectivity({ status: 'error', message: err.message })
		} finally {
			setLoading(false)
		}
	}

	const volverInicio = () => {
		setActiveSection('consulta')
	}

	return (
		<div className="app">
			<header className="header">
				<div className="container">
					<div className="header-content">
						<button className="logo-button" onClick={volverInicio}>
							<div className="logo">
								<Building size={32} />
								<h1 className="logo-text">Copuno</h1>
							</div>
						</button>
						<div className="header-info">
							<h2 className="app-title">Gestión de Partes</h2>
							<div className={`connectivity-status ${connectivity.status}`}>
								{connectivity.status === 'ok' ? (
									<>
										<Wifi size={14} />
										<span>{connectivity.message}</span>
									</>
								) : connectivity.status === 'error' ? (
									<>
										<WifiOff size={14} />
										<span>{connectivity.message}</span>
									</>
								) : (
									<>
										<Loader2 size={14} className="loading-spinner" />
										<span>{connectivity.message}</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="main">
				<div className="container">
					{/* Debug info - solo en desarrollo */}
					{!loading && !error && process.env.NODE_ENV === 'development' && (
						<div className="debug-info">
							<strong>Debug:</strong> Obras: {datos.obras.length} | 
							Empleados: {datos.empleados.length} | 
							Jefes: {datos.jefesObra.length} | 
							Partes: {datos.partesTrabajo.length}
						</div>
					)}

					{/* Navegación principal */}
					<div className="navigation">
						<button
							className={`nav-btn ${activeSection === 'consulta' ? 'active' : ''}`}
							onClick={() => setActiveSection('consulta')}
						>
							<Search size={24} />
							<span>Consultar Partes</span>
						</button>
						<button
							className={`nav-btn ${activeSection === 'crear' ? 'active' : ''}`}
							onClick={() => setActiveSection('crear')}
						>
							<Plus size={24} />
							<span>Crear Nuevo Parte</span>
						</button>
					</div>

					{/* Contenido principal */}
					<div className="content">
						{loading ? (
							<div className="loading-container">
								<Loader2 size={48} className="loading-spinner" />
								<p className="loading-text">Cargando datos desde Notion...</p>
								{connectivity.status === 'checking' && (
									<p className="loading-subtext">Verificando conectividad...</p>
								)}
							</div>
						) : error ? (
							<div className="error-container">
								<div className="error-header">
									<WifiOff size={48} className="error-icon" />
									<h3 className="error-title">Error de Conectividad</h3>
								</div>
								<p className="error-text">{error}</p>
								<div className="error-actions">
									<button className="btn btn-primary" onClick={cargarDatos}>
										<Wifi size={20} />
										Reintentar Conexión
									</button>
									<button className="btn btn-secondary" onClick={() => window.location.reload()}>
										Recargar Página
									</button>
								</div>
							</div>
						) : (
							<>
								{activeSection === 'consulta' ? (
									<ConsultaPartes datos={datos} />
								) : (
									<CrearParte datos={datos} onParteCreado={cargarDatos} />
								)}
							</>
						)}
					</div>
				</div>
			</main>
		</div>
	)
}

// Componente para consultar partes existentes
function ConsultaPartes({ datos }) {
	const [filtroObra, setFiltroObra] = useState('')
	const [filtroFecha, setFiltroFecha] = useState('')
	const [parteSeleccionado, setParteSeleccionado] = useState(null)

	// Función para normalizar fechas para comparación
	const normalizarFecha = (fecha) => {
		if (!fecha) return ''
		// Si la fecha viene de Notion, puede tener formato ISO
		const fechaObj = new Date(fecha)
		if (isNaN(fechaObj.getTime())) return fecha
		return fechaObj.toISOString().split('T')[0]
	}

	// Función para formatear fechas en formato español
	const formatearFecha = (fecha) => {
		if (!fecha) return 'Sin fecha'
		try {
			const fechaObj = new Date(fecha)
			if (isNaN(fechaObj.getTime())) return fecha
			
			// Formatear en DD-MM-YYYY HH:MM (hora de España)
			const dia = fechaObj.getDate().toString().padStart(2, '0')
			const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0')
			const año = fechaObj.getFullYear()
			const hora = fechaObj.getHours().toString().padStart(2, '0')
			const minutos = fechaObj.getMinutes().toString().padStart(2, '0')
			
			return `${dia}-${mes}-${año} ${hora}:${minutos}`
		} catch (error) {
			return fecha
		}
	}

	// Filtrar partes según los criterios
	const partesFiltrados = datos.partesTrabajo.filter(parte => {
		const cumpleObra = !filtroObra || parte.obra === filtroObra
		const cumpleFecha = !filtroFecha || normalizarFecha(parte.fecha) === filtroFecha
		return cumpleObra && cumpleFecha
	})

	// Obtener obras únicas para el filtro - usar todas las obras disponibles
	const obrasUnicas = datos.obras.map(obra => obra.nombre).filter(obra => obra)

	// Obtener fechas únicas para debug
	const fechasUnicas = [...new Set(datos.partesTrabajo.map(parte => normalizarFecha(parte.fecha)))].filter(fecha => fecha)

	const verDetalles = (parte) => {
		setParteSeleccionado(parte)
	}

	const cerrarDetalles = () => {
		setParteSeleccionado(null)
	}

	return (
		<div className="consulta-section">
			{parteSeleccionado ? (
				<div className="detalles-modal">
					<div className="detalles-content">
						<div className="detalles-header">
							<button className="btn-close" onClick={cerrarDetalles}>
								<ArrowLeft size={20} />
								Volver
							</button>
							<h2 className="detalles-title">{parteSeleccionado.nombre}</h2>
						</div>
						<div className="detalles-info">
							<div className="info-grid">
								<div className="info-item">
									<Building size={20} />
									<span><strong>Obra:</strong> {parteSeleccionado.obra || 'Sin obra'}</span>
								</div>
								<div className="info-item">
									<Calendar size={20} />
									<span><strong>Fecha:</strong> {formatearFecha(parteSeleccionado.fecha)}</span>
								</div>
								<div className="info-item">
									<Users size={20} />
									<span><strong>Horas Oficial 1ª:</strong> {parteSeleccionado.horasOficial1 || 0}h</span>
								</div>
								<div className="info-item">
									<Users size={20} />
									<span><strong>Horas Oficial 2ª:</strong> {parteSeleccionado.horasOficial2 || 0}h</span>
								</div>
								<div className="info-item">
									<Users size={20} />
									<span><strong>Horas Capataz:</strong> {parteSeleccionado.horasCapataz || 0}h</span>
								</div>
								<div className="info-item">
									<Users size={20} />
									<span><strong>Horas Encargado:</strong> {parteSeleccionado.horasEncargado || 0}h</span>
								</div>
								<div className="info-item">
									<FileText size={20} />
									<span><strong>Importe Total:</strong> {parteSeleccionado.importeTotal || 0}€</span>
								</div>
								<div className="info-item">
									<span><strong>Estado:</strong> {parteSeleccionado.estado || 'Pendiente'}</span>
								</div>
							</div>
							{parteSeleccionado.notas && (
								<div className="notas-section">
									<h3>Notas:</h3>
									<p>{parteSeleccionado.notas}</p>
								</div>
							)}
							{parteSeleccionado.urlPDF && (
								<div className="pdf-section">
									<button className="btn btn-primary" onClick={() => window.open(parteSeleccionado.urlPDF, '_blank')}>
										<FileText size={20} />
										Descargar PDF
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="card">
						<div className="card-header">
							<h2 className="card-title">Consultar Partes Existentes</h2>
							<p className="card-subtitle">Busca y visualiza los partes de trabajo</p>
						</div>

						{/* Filtros */}
						<div className="filtros">
							<div className="grid grid-2">
								<div className="form-group">
									<label className="form-label">Filtrar por Obra:</label>
									<select
										className="form-select"
										value={filtroObra}
										onChange={(e) => setFiltroObra(e.target.value)}
									>
										<option value="">Todas las obras</option>
										{obrasUnicas.map(obra => (
											<option key={obra} value={obra}>{obra}</option>
										))}
									</select>
								</div>
								<div className="form-group">
									<label className="form-label">Filtrar por Fecha:</label>
									<input
										type="date"
										className="form-input"
										value={filtroFecha}
										onChange={(e) => setFiltroFecha(e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* Debug info para filtros - solo en desarrollo */}
						{process.env.NODE_ENV === 'development' && (
							<div className="debug-filtros">
								<strong>Debug Filtros:</strong> Obras disponibles: {obrasUnicas.length} | 
								Partes totales: {datos.partesTrabajo.length} | 
								Partes filtrados: {partesFiltrados.length} | 
								Fechas disponibles: {fechasUnicas.length}
								{filtroFecha && (
									<span> | Fecha filtro: {filtroFecha}</span>
								)}
							</div>
						)}

						{/* Lista de partes */}
						<div className="partes-lista">
							{partesFiltrados.length === 0 ? (
								<div className="no-partes">
									<p className="text-large">No se encontraron partes con los filtros seleccionados</p>
									<p className="text-small">
										Obras disponibles: {obrasUnicas.join(', ')}
									</p>
									{fechasUnicas.length > 0 && (
										<p className="text-small">
											Fechas disponibles: {fechasUnicas.join(', ')}
										</p>
									)}
								</div>
							) : (
								partesFiltrados.map((parte) => (
									<div key={parte.id} className="parte-card">
										<div className="parte-header">
											<h3 className="parte-nombre">{parte.nombre}</h3>
											<span className={`estado-badge ${parte.estado?.toLowerCase() || 'pendiente'}`}>
												{parte.estado || 'Pendiente'}
											</span>
										</div>
										<div className="parte-info">
											<div className="info-item">
												<Building size={20} />
												<span>Obra: {parte.obra || 'Sin obra'}</span>
											</div>
											<div className="info-item">
												<Calendar size={20} />
												<span>Fecha: {formatearFecha(parte.fecha)}</span>
											</div>
											<div className="info-item">
												<Users size={20} />
												<span>Horas: {parte.horasOficial1 + parte.horasOficial2 + parte.horasCapataz + parte.horasEncargado || 0}h</span>
											</div>
											<div className="info-item">
												<FileText size={20} />
												<span>Importe: {parte.importeTotal || 0}€</span>
											</div>
										</div>
										<div className="parte-acciones">
											<button className="btn btn-primary" onClick={() => verDetalles(parte)}>
												Ver Detalles
											</button>
											{parte.urlPDF && (
												<button className="btn btn-secondary" onClick={() => window.open(parte.urlPDF, '_blank')}>
													Descargar PDF
												</button>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

// Componente para crear nuevo parte
function CrearParte({ datos, onParteCreado }) {
	const [formData, setFormData] = useState({
		obraId: '',
		obra: '',
		fecha: '',
		jefeObraId: '',
		jefeObra: '',
		empleados: [],
		notas: ''
	})
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setMessage('')

		try {
			// Encontrar la obra seleccionada
			const obraSeleccionada = datos.obras.find(obra => obra.id === formData.obraId)
			const jefeSeleccionado = datos.jefesObra.find(jefe => jefe.id === formData.jefeObraId)

			if (!obraSeleccionada || !jefeSeleccionado) {
				throw new Error('Por favor, selecciona una obra y un jefe de obra válidos')
			}

			await crearParteTrabajo({
				obra: obraSeleccionada.nombre,
				obraId: formData.obraId,
				fecha: formData.fecha,
				jefeObraId: formData.jefeObraId,
				notas: formData.notas
			})

			setMessage('Parte creado exitosamente')
			setFormData({
				obraId: '',
				obra: '',
				fecha: '',
				jefeObraId: '',
				jefeObra: '',
				empleados: [],
				notas: ''
			})

			// Recargar datos
			if (onParteCreado) {
				onParteCreado()
			}
		} catch (error) {
			console.error('Error al crear parte:', error)
			setMessage(`Error al crear el parte: ${error.message}`)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="crear-section">
			<div className="card">
				<div className="card-header">
					<h2 className="card-title">Crear Nuevo Parte</h2>
					<p className="card-subtitle">Completa la información para crear un nuevo parte de trabajo</p>
				</div>

				<form onSubmit={handleSubmit} className="formulario-parte">
					{message && (
						<div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
							{message}
						</div>
					)}
					
					<div className="grid grid-2">
						<div className="form-group">
							<label className="form-label">Seleccionar Obra:</label>
							<select
								className="form-select"
								value={formData.obraId}
								onChange={(e) => setFormData({...formData, obraId: e.target.value})}
								required
							>
								<option value="">Selecciona una obra</option>
								{datos.obras.map(obra => (
									<option key={obra.id} value={obra.id}>
										{obra.nombre} - {obra.provincia}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label className="form-label">Fecha del Parte:</label>
							<input
								type="date"
								className="form-input"
								value={formData.fecha}
								onChange={(e) => setFormData({...formData, fecha: e.target.value})}
								required
							/>
						</div>
					</div>

					<div className="form-group">
						<label className="form-label">Jefe de Obra:</label>
						<select
							className="form-select"
							value={formData.jefeObraId}
							onChange={(e) => setFormData({...formData, jefeObraId: e.target.value})}
							required
						>
							<option value="">Selecciona un jefe de obra</option>
							{datos.jefesObra.map(jefe => (
								<option key={jefe.id} value={jefe.id}>
									{jefe.nombre} ({jefe.email})
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label className="form-label">Empleados que trabajaron:</label>
						<div className="empleados-lista">
							{datos.empleados.map(empleado => (
								<label key={empleado.id} className="empleado-checkbox">
									<input
										type="checkbox"
										checked={formData.empleados.includes(empleado.id)}
										onChange={(e) => {
											if (e.target.checked) {
												setFormData({
													...formData,
													empleados: [...formData.empleados, empleado.id]
												})
											} else {
												setFormData({
													...formData,
													empleados: formData.empleados.filter(id => id !== empleado.id)
												})
											}
										}}
									/>
									<span className="empleado-info">
										<strong>{empleado.nombre}</strong>
										<span className="categoria">{empleado.categoria} - {empleado.localidad}</span>
									</span>
								</label>
							))}
						</div>
					</div>

					<div className="form-group">
						<label className="form-label">Notas Adicionales:</label>
						<textarea
							className="form-input"
							rows="4"
							value={formData.notas}
							onChange={(e) => setFormData({...formData, notas: e.target.value})}
							placeholder="Añade cualquier nota o comentario sobre el trabajo realizado..."
						/>
					</div>

					<div className="form-actions">
						<button type="submit" className="btn btn-success" disabled={loading}>
							{loading ? (
								<>
									<Loader2 size={24} className="loading-spinner" />
									Creando...
								</>
							) : (
								<>
									<Plus size={24} />
									Crear Parte
								</>
							)}
						</button>
						<button type="button" className="btn btn-secondary" disabled={loading}>
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default App 