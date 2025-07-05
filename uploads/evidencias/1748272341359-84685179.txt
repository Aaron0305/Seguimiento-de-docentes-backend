    import { useState, useEffect } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Home, Puzzle, LineChart, AlertCircle, X } from 'lucide-react';
    import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
    import { useUser } from '../contexts/UserContext';

    function NavLink({ to, children, icon }) {
    return (
        <Link
        to={to}
        className="group relative px-4 py-2 text-black font-medium hover:text-[#3A6EA5] transition-all duration-300"
        >
        <span className="flex items-center gap-2">
            {icon && <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
            {children}
        </span>
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3A6EA5] opacity-0 transform scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 origin-left"></span>
        <span className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-[#3A6EA5] opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"></span>
        </Link>
    );
    }

    function NavLinkMobile({ to, children, onClick, icon }) {
    return (
        <Link
        to={to}
        onClick={onClick}
        className="block px-4 py-3 rounded-lg text-black font-medium hover:text-[#3A6EA5] hover:bg-white/20 transition-all duration-200 hover:pl-6"
        >
        <span className="flex items-center gap-2">
            {icon && <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
            {children}
        </span>
        </Link>
    );
    }

    // Modal de confirmación de logout
    function LogoutModal({ isOpen, onClose, onConfirm, userName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header gradient */}
            <div className="h-2 bg-gradient-to-r from-[#EAC4D5] via-[#B8E0D2] to-[#95B8D1] rounded-t-2xl"></div>
            
            {/* Close button */}
            <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
            <X size={20} />
            </button>

            {/* Content */}
            <div className="p-8 pt-6">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EAC4D5] to-[#95B8D1] rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-white" />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
                Cerrar Sesión
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
                {userName && (
                <span className="block text-lg font-medium text-[#3A6EA5] mb-2">
                    ¡Hola {userName}! 👋
                </span>
                )}
                ¿Estás seguro de que deseas cerrar tu sesión?
            </p>

            {/* Buttons */}
            <div className="flex space-x-3">
                <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:scale-105"
                >
                Cancelar
                </button>
                <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EAC4D5] to-[#95B8D1] hover:from-[#EAC4D5] hover:to-[#809BCE] text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                Sí, cerrar sesión
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    }

    export default function NavbarLogin() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { user, logout } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        // Cierra el modal primero
        setShowLogoutModal(false);
        
        // Activa el spinner de carga
        setIsLoggingOut(true);

        try {
        // Pequeña pausa para asegurar que el spinner se muestre
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Limpia sesión y utiliza la función logout del contexto
        sessionStorage.clear();
        logout();
        
        // Espera antes de redirigir para que el spinner sea visible
        setTimeout(() => {
            // Redirige a la página de inicio con reemplazo de la entrada actual en el historial
            navigate('/', { replace: true });
            
            // Desactiva el spinner después de la redirección
            setIsLoggingOut(false);
        }, 800);
        } catch (error) {
        console.error('Error al cerrar sesión:', error);
        setIsLoggingOut(false);
        }
    };

    const openLogoutModal = () => {
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
        {/* Modal de confirmación */}
        <LogoutModal
            isOpen={showLogoutModal}
            onClose={closeLogoutModal}
            onConfirm={handleLogout}
            userName={user?.nombre}
        />

        {/* Overlay de carga con mayor z-index y fondo translúcido */}
        {isLoggingOut && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
            <LoadingSpinner />
            </div>
        )}

        <nav className={`fixed w-full z-50 transition-all duration-300 ${
            scrolled
            ? 'bg-[#95B8D1]/98 backdrop-blur-lg shadow-lg shadow-[#809BCE]/30'
            : 'bg-gradient-to-r from-[#EAC4D5]/98 to-[#B8E0D2]/98 backdrop-blur-md'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
                <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="group flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#95B8D1] to-[#EAC4D5] flex items-center justify-center mr-2 group-hover:scale-110 transition-all duration-300">
                    <span className="text-black font-bold text-sm">DK</span>
                    </div>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#95B8D1] to-[#EAC4D5] text-xl md:text-2xl font-extrabold group-hover:from-[#809BCE] group-hover:to-[#EAC4D5] transition-all duration-300 relative">
                    DislexiaKids
                    <span className="absolute -inset-0.5 blur-sm bg-gradient-to-r from-[#95B8D1]/40 to-[#EAC4D5]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                    <span className="absolute -inset-0.5 animate-pulse bg-gradient-to-r from-[#95B8D1]/20 to-[#EAC4D5]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                    </span>
                </Link>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                <div className="flex space-x-1">
                    <NavLink to="/" icon={<Home size={18} />}>Inicio</NavLink>
                    <NavLink 
                    to="/exercises" 
                    icon={
                        <span className="group-hover:animate-bounce transition-all duration-300">
                        <Puzzle size={18} className="text-[#3A6EA5] transform group-hover:rotate-12 transition-transform" />
                        </span>
                    }
                    >
                    Ejercicios
                    </NavLink>
                    <NavLink to="/progress" icon={<LineChart size={18} />}>Progreso</NavLink>
                    {user && (
                    <div className="relative group">
                        <button className="flex items-center px-4 py-2 text-black font-medium">
                        <span className="mr-2">👤</span>
                        {user.nombre || 'Usuario'}
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</Link>
                        </div>
                    </div>
                    )}
                </div>

                {user && (
                    <div className="ml-6 flex items-center">
                    <button
                        onClick={openLogoutModal}
                        className="relative overflow-hidden px-6 py-2 rounded-full group"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#EAC4D5] to-[#B8E0D2] group-hover:from-[#EAC4D5] group-hover:to-[#95B8D1] transition-all duration-300"></span>
                        <span className="relative flex items-center">
                        <span className="mr-2">👋</span>
                        <span className="font-medium">Cerrar sesión</span>
                        </span>
                    </button>
                    </div>
                )}
                </div>

                <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-black inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
                    aria-expanded={isOpen}
                    aria-label="Menú principal"
                >
                    {!isOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    )}
                </button>
                </div>
            </div>
            </div>

            <div
            className={`md:hidden absolute w-full transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
            >
            <div className="bg-gradient-to-b from-[#B8E0D2]/98 to-[#95B8D1]/98 backdrop-blur-md px-4 py-3 space-y-2 shadow-lg shadow-[#809BCE]/20">
                <NavLinkMobile to="/" onClick={() => setIsOpen(false)} icon={<Home size={18} />}>Inicio</NavLinkMobile>
                <NavLinkMobile 
                to="/exercises" 
                onClick={() => setIsOpen(false)} 
                icon={
                    <span className="group-hover:animate-bounce transition-all duration-300">
                    <Puzzle size={18} className="text-[#3A6EA5] transform group-hover:rotate-12 transition-transform" />
                    </span>
                }
                >
                Ejercicios
                </NavLinkMobile>
                <NavLinkMobile to="/progress" onClick={() => setIsOpen(false)} icon={<LineChart size={18} />}>Progreso</NavLinkMobile>
                {user && (
                <>
                    <NavLinkMobile to="/profile" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center">
                        <span className="mr-2">👤</span>
                        Perfil
                    </div>
                    </NavLinkMobile>
                    <div className="pt-2 pb-3">
                    <button
                        onClick={() => {
                        setIsOpen(false);
                        openLogoutModal();
                        }}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-[#EAC4D5] to-[#B8E0D2] text-black font-medium hover:from-[#EAC4D5] hover:to-[#95B8D1] transition-all duration-300"
                    >
                        <span className="mr-2">👋</span> Cerrar sesión
                    </button>
                    </div>
                </>
                )}
            </div>
            </div>
        </nav>
        </>
    );
    }