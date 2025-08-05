import React, { useState, useEffect } from 'react'
import { Search, Plus, FileText, Calendar, Users, Building, Loader2, Wifi, WifiOff, Home, ArrowLeft, Clock, User } from 'lucide-react'
import { getDatosCompletos, crearParteTrabajo, checkConnectivity, retryOperation, getDetallesEmpleados, getEmpleadosObra } from './services/notionService'
import './App.css'

function App() {
	const [activeSection, setActiveSection] = useState('main') // Cambiado de 'consulta' a 'main'
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
		setActiveSection('main')
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
								{activeSection === 'main' ? (
									<PantallaPrincipal onNavigate={setActiveSection} />
								) : activeSection === 'consulta' ? (
									<ConsultaPartes datos={datos} onVolver={() => setActiveSection('main')} />
								) : activeSection === 'crear' ? (
									<CrearParte datos={datos} onParteCreado={cargarDatos} onVolver={() => setActiveSection('main')} />
								) : null}
							</>
						)}
					</div>
				</div>
			</main>
		</div>
	)
}

// Componente para la pantalla principal
function PantallaPrincipal({ onNavigate }) {
	return (
		<div className="pantalla-principal">
			<div className="welcome-section">
				<div className="welcome-content">
					<h1 className="welcome-title">Bienvenido a Copuno</h1>
					<p className="welcome-subtitle">Sistema de Gestión de Partes de Trabajo</p>
					<p className="welcome-description">
						Selecciona una opción para comenzar a gestionar los partes de trabajo
					</p>
				</div>
			</div>

			<div className="main-actions">
				<div className="action-card" onClick={() => onNavigate('crear')}>
					<div className="action-icon">
						<Plus size={48} />
					</div>
					<h3 className="action-title">Crear Nuevo Parte</h3>
					<p className="action-description">
						Crea un nuevo parte de trabajo con empleados, horas y detalles
					</p>
				</div>

				<div className="action-card" onClick={() => onNavigate('consulta')}>
					<div className="action-icon">
						<Search size={48} />
					</div>
					<h3 className="action-title">Consultar Partes</h3>
					<p className="action-description">
						Busca y visualiza los partes de trabajo existentes
					</p>
				</div>
			</div>
		</div>
	)
}

// Componente para consultar partes existentes
function ConsultaPartes({ datos, onVolver }) {
	const [filtroObra, setFiltroObra] = useState('')
	const [filtroFecha, setFiltroFecha] = useState('')
	const [parteSeleccionado, setParteSeleccionado] = useState(null)
	const [detallesEmpleados, setDetallesEmpleados] = useState([])
	const [loadingDetalles, setLoadingDetalles] = useState(false)

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

	const verDetalles = async (parte) => {
		setParteSeleccionado(parte)
		setLoadingDetalles(true)
		setDetallesEmpleados([])

		try {
			const detalles = await getDetallesEmpleados(parte.id)
			setDetallesEmpleados(detalles)
		} catch (error) {
			console.error('Error al cargar detalles de empleados:', error)
		} finally {
			setLoadingDetalles(false)
		}
	}

	const cerrarDetalles = () => {
		setParteSeleccionado(null)
		setDetallesEmpleados([])
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
							{/* Sección de empleados asignados */}
							<div className="empleados-section">
								<h3>Empleados Asignados</h3>
								{loadingDetalles ? (
									<div className="loading-detalles">
										<Loader2 size={24} className="loading-spinner" />
										<p>Cargando detalles de empleados...</p>
									</div>
								) : detallesEmpleados.length > 0 ? (
									<div className="empleados-lista-detalles">
										{detallesEmpleados.map((detalle, index) => (
											<div key={detalle.id || index} className="empleado-detalle">
												<div className="empleado-info-detalle">
													<div className="empleado-nombre">
														<User size={16} />
														<span>{detalle.empleadoNombre || 'Empleado sin nombre'}</span>
													</div>
													<div className="empleado-categoria">
														<span className="categoria-badge">{detalle.categoria || 'Sin categoría'}</span>
													</div>
													<div className="empleado-horas">
														<Clock size={16} />
														<span>{detalle.horas || 0} horas</span>
													</div>
												</div>
												{detalle.detalle && (
													<div className="empleado-notas">
														<p>{detalle.detalle}</p>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="no-empleados">
										<p>No hay empleados asignados a este parte</p>
									</div>
								)}
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
					<div className="section-header">
						<button className="btn-back" onClick={onVolver}>
							<ArrowLeft size={20} />
							Volver al Inicio
						</button>
						<h2 className="section-title">Consultar Partes Existentes</h2>
					</div>

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
function CrearParte({ datos, onParteCreado, onVolver }) {
	// Función para obtener fecha y hora actual en formato YYYY-MM-DDTHH:MM
	const getCurrentDateTime = () => {
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		const hours = String(now.getHours()).padStart(2, '0')
		const minutes = String(now.getMinutes()).padStart(2, '0')
		return `${year}-${month}-${day}T${hours}:${minutes}`
	}

	const [formData, setFormData] = useState({
		obraId: '',
		obra: '',
		fecha: getCurrentDateTime(),
		jefeObraId: '',
		jefeObra: '',
		empleados: [],
		empleadosHoras: {}, // Nuevo objeto para almacenar horas por empleado
		notas: ''
	})
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [empleadosObra, setEmpleadosObra] = useState([])
	const [loadingEmpleados, setLoadingEmpleados] = useState(false)
	const [parteCreado, setParteCreado] = useState(null)
	const [showOpciones, setShowOpciones] = useState(false)

	// Función para cargar empleados de una obra
	const cargarEmpleadosObra = async (obraId) => {
		if (!obraId) {
			setEmpleadosObra([])
			return
		}

		setLoadingEmpleados(true)
		try {
			const empleados = await getEmpleadosObra(obraId)
			setEmpleadosObra(empleados)
		} catch (error) {
			console.error('Error al cargar empleados de la obra:', error)
			setEmpleadosObra([])
		} finally {
			setLoadingEmpleados(false)
		}
	}

	// Función para manejar el cambio de obra
	const handleObraChange = (obraId) => {
		setFormData({
			...formData,
			obraId,
			empleados: [], // Limpiar empleados seleccionados al cambiar obra
			empleadosHoras: {} // Limpiar horas al cambiar obra
		})
		cargarEmpleadosObra(obraId)
	}

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

			const parteCreado = await crearParteTrabajo({
				obra: obraSeleccionada.nombre,
				obraId: formData.obraId,
				fecha: formData.fecha,
				jefeObraId: formData.jefeObraId,
				notas: formData.notas,
				empleados: formData.empleados,
				empleadosHoras: formData.empleadosHoras
			})

			setParteCreado(parteCreado)
			setShowOpciones(true)
			setMessage(parteCreado.mensaje || 'Parte creado exitosamente')

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

	// Función para volver al formulario
	const volverAFormulario = () => {
		setFormData({
			obraId: '',
			obra: '',
			fecha: getCurrentDateTime(),
			jefeObraId: '',
			jefeObra: '',
			empleados: [],
			empleadosHoras: {},
			notas: ''
		})
		setEmpleadosObra([])
		setParteCreado(null)
		setShowOpciones(false)
		setMessage('')
	}

	// Función para ver detalles del parte creado
	const verDetallesParte = () => {
		// Cambiar a la sección de consulta y mostrar detalles
		// Esto requeriría pasar el parte creado a la sección de consulta
		// Por ahora, simplemente volvemos al formulario
		volverAFormulario()
	}

	return (
		<div className="crear-section">
			<div className="section-header">
				<button className="btn-back" onClick={onVolver}>
					<ArrowLeft size={20} />
					Volver al Inicio
				</button>
				<h2 className="section-title">Crear Nuevo Parte</h2>
			</div>

			<div className="card">
				<div className="card-header">
					<h2 className="card-title">Crear Nuevo Parte</h2>
					<p className="card-subtitle">Completa la información para crear un nuevo parte de trabajo</p>
				</div>

				{showOpciones ? (
					<div className="parte-creado-opciones">
						<div className="message success">
							{message}
						</div>
						<div className="opciones-container">
							<h3>¿Qué quieres hacer ahora?</h3>
							<div className="opciones-buttons">
								<button 
									type="button" 
									className="btn btn-primary" 
									onClick={volverAFormulario}
								>
									<Plus size={20} />
									Crear Otro Parte
								</button>
								<button 
									type="button" 
									className="btn btn-secondary" 
									onClick={verDetallesParte}
								>
									<FileText size={20} />
									Ver Detalles del Parte
								</button>
							</div>
							{parteCreado && (
								<div className="parte-info-resumen">
									<p><strong>Parte creado:</strong> {parteCreado.properties?.Nombre?.title?.[0]?.plain_text || 'Sin nombre'}</p>
									<p><strong>Empleados asignados:</strong> {parteCreado.empleadosCreados || 0}</p>
									{parteCreado.detallesCreados > 0 && (
										<p><strong>Detalles de horas creados:</strong> {parteCreado.detallesCreados}</p>
									)}
									{parteCreado.erroresDetalles > 0 && (
										<p className="error-info"><strong>Errores en detalles:</strong> {parteCreado.erroresDetalles}</p>
									)}
								</div>
							)}
						</div>
					</div>
				) : (
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
								onChange={(e) => handleObraChange(e.target.value)}
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
							<label className="form-label">Fecha y Hora del Parte:</label>
							<input
								type="datetime-local"
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
						<label className="form-label">Empleados asignados a la obra:</label>
						{!formData.obraId ? (
							<div className="empleados-placeholder">
								<p>Selecciona una obra para ver los empleados asignados</p>
							</div>
						) : loadingEmpleados ? (
							<div className="empleados-loading">
								<Loader2 size={20} className="loading-spinner" />
								<p>Cargando empleados de la obra...</p>
							</div>
						) : empleadosObra.length === 0 ? (
							<div className="empleados-empty">
								<p>No hay empleados asignados a esta obra</p>
							</div>
						) : (
							<div className="empleados-lista">
								{empleadosObra.map(empleado => (
									<div key={empleado.id} className="empleado-item">
										<label className="empleado-checkbox">
											<input
												type="checkbox"
												checked={formData.empleados.includes(empleado.id)}
												onChange={(e) => {
													if (e.target.checked) {
														setFormData({
															...formData,
															empleados: [...formData.empleados, empleado.id],
															empleadosHoras: {
																...formData.empleadosHoras,
																[empleado.id]: 8 // Horas por defecto
															}
														})
													} else {
														const newEmpleadosHoras = { ...formData.empleadosHoras }
														delete newEmpleadosHoras[empleado.id]
														setFormData({
															...formData,
															empleados: formData.empleados.filter(id => id !== empleado.id),
															empleadosHoras: newEmpleadosHoras
														})
													}
												}}
											/>
											<span className="empleado-info">
												<div className="empleado-nombre-estado">
													<strong>{empleado.nombre}</strong>
													<span className={`estado-empleado ${empleado.estado?.toLowerCase() || 'sin-estado'}`}>
														{empleado.estado || 'Sin estado'}
													</span>
												</div>
												<span className="categoria">{empleado.categoria} - {empleado.localidad}</span>
											</span>
										</label>
										{formData.empleados.includes(empleado.id) && (
											<div className="empleado-horas-input">
												<label className="horas-label">Horas trabajadas:</label>
												<input
													type="number"
													className="horas-input"
													min="0"
													max="24"
													step="0.5"
													value={formData.empleadosHoras[empleado.id] || 8}
													onChange={(e) => {
														const horas = parseFloat(e.target.value) || 0
														setFormData({
															...formData,
															empleadosHoras: {
																...formData.empleadosHoras,
																[empleado.id]: horas
															}
														})
													}}
												/>
												<span className="horas-unidad">h</span>
											</div>
										)}
									</div>
								))}
							</div>
						)}
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
				)}
			</div>
		</div>
	)
}

export default App 