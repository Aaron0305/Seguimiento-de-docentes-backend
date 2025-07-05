import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book,Brain,BarChart,Users,ChevronRight,CheckCircle,MessageCircle,ArrowRight, Star,Heart,Play,Instagram,Facebook,Twitter,Phone} from 'lucide-react';

// Custom hook para animaciones de entrada
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold }
    );

    observer.observe(ref);
    
    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, threshold]);

  return [setRef, isVisible];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('que-es');
  
  // Referencias para animaciones
  const [heroRef, heroIsVisible] = useScrollAnimation(0.2);
  const [infoRef, infoIsVisible] = useScrollAnimation(0.2);
  const [featuresRef, featuresIsVisible] = useScrollAnimation(0.2);
  const [videoRef, videoIsVisible] = useScrollAnimation(0.2);
  const [ctaRef, ctaIsVisible] = useScrollAnimation(0.2);
  const [footerRef, footerIsVisible] = useScrollAnimation(0.1);

  // Datos para la sección de síntomas
  const sintomas = [
    "Dificultad para leer con fluidez",
    "Problemas para deletrear palabras",
    "Confusión de letras similares (b/d, p/q)",
    "Dificultad para seguir instrucciones escritas",
    "Problemas de comprensión lectora"
  ];

  // Características del programa
  const caracteristicas = [
    {
      icon: <Brain size={24} />,
      title: "Ejercicios interactivos",
      description: "Actividades multisensoriales diseñadas por especialistas para fortalecer habilidades de lectura y escritura.",
      color: "bg-[#EAC4D5]/30"
    },
    {
      icon: <BarChart size={24} />,
      title: "Seguimiento de progreso",
      description: "Monitorización detallada del avance con informes personalizados que permiten ajustar el plan de intervención.",
      color: "bg-[#EAC4D5]/30"
    },
    {
      icon: <Users size={24} />,
      title: "Comunidad de apoyo",
      description: "Conecta con otras familias y profesionales que entienden los desafíos de la dislexia.",
      color: "bg-[#EAC4D5]/30"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Orientación profesional",
      description: "Acceso a consultas con especialistas en dislexia para resolver dudas específicas.",
      color: "bg-[#EAC4D5]/30"
    }
  ];
  
  return (
    <div className="min-h-screen bg-[#D6EADF]/20 font-sans">
      {/* Hero Section con animaciones mejoradas */}
      <section
        ref={heroRef}
        className={`bg-gradient-to-r from-[#EAC4D5] to-[#95B8D1] pt-24 pb-16 relative overflow-hidden transition-all duration-1000 ease-out ${
          heroIsVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Elementos decorativos animados */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/10 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white/10 animate-pulse" style={{animationDuration: '6s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className={`md:w-3/5 mb-8 md:mb-0 transition-all duration-1000 delay-300 ${
              heroIsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black leading-tight">
                Apoyo integral para niños con dislexia
              </h1>
              <p className="text-xl mb-8 text-black/90 font-light">
                Recursos especializados, ejercicios interactivos y orientación profesional para superar los desafíos de la dislexia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#B8E0D2] text-black font-semibold px-6 py-3 rounded-md hover:bg-[#D6EADF] transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group">
                  <span>Sobre nosotros</span>
                  <ArrowRight className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={18} />
                </button>
                <button className="bg-transparent border-2 border-[#B8E0D2] text-black font-semibold px-6 py-3 rounded-md hover:bg-[#B8E0D2]/20 transition-all duration-300 transform hover:scale-105">
                  Comenzar ahora
                </button>
              </div>
            </div>
            <div className={`md:w-2/5 transition-all duration-1000 delay-500 ${
              heroIsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <div className="relative">
                <img 
                  src="/src/image/niñoss.png"
                  alt="Niños felices aprendiendo" 
                  className="rounded-lg shadow-xl w-full h-auto object-cover transform transition-transform duration-500 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 rounded-lg shadow-inner border border-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Información sobre dislexia */}
      <section
        ref={infoRef}
        className={`py-16 bg-white transition-all duration-1000 ease-out ${
          infoIsVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`text-center mb-12 transition-all duration-700 delay-200 ${
            infoIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-black relative inline-block">
              Entendiendo la Dislexia
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-[#fffff] rounded-full"></span>
            </h2>
            <p className="text-black/80 mt-6 max-w-2xl mx-auto text-lg">
              Información basada en investigaciones científicas para ayudar a padres, educadores y niños
            </p>
          </div>
          
          <div className={`mb-8 transition-all duration-700 delay-400 ${
            infoIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex flex-wrap border-b border-[#95B8D1]">
              {['que-es', 'sintomas', 'diagnostico'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-all duration-300 relative ${
                    activeTab === tab 
                      ? 'text-black' 
                      : 'text-black/70 hover:text-black/90'
                  }`}
                >
                  {tab === 'que-es' && '¿Qué es?'}
                  {tab === 'sintomas' && 'Síntomas'}
                  {tab === 'diagnostico' && 'Diagnóstico'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EAC4D5] transform scale-x-100 transition-transform duration-300"></span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="py-8">
              {activeTab === 'que-es' && (
                <div className="text-black space-y-4 animate-fadeIn">
                  <p className="text-gray-700 leading-relaxed">
                    La dislexia es un trastorno específico del aprendizaje de origen neurobiológico. Se caracteriza por dificultades en el reconocimiento preciso y fluido de palabras, y por problemas de ortografía y decodificación.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Estas dificultades típicamente resultan de un déficit en el componente fonológico del lenguaje y suelen ser inesperadas en relación con otras habilidades cognitivas.
                  </p>
                  <div className="p-4 bg-[#B8E0D2]/10 rounded-lg border-l-4 border-[#809BCE] mt-6">
                    <p className="text-gray-700 font-medium">
                      La dislexia afecta aproximadamente al 10-15% de la población mundial y no está relacionada con la inteligencia o el esfuerzo del niño.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'sintomas' && (
                <div className="animate-fadeIn">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Los síntomas de la dislexia pueden variar según la edad y la etapa de desarrollo, pero algunos signos comunes incluyen:
                  </p>
                  <ul className="space-y-4">
                    {sintomas.map((sintoma, index) => (
                      <li key={index} className="flex items-start group">
                        <span className="text-[#809BCE] mr-3 mt-0.5 transform transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                          <CheckCircle size={22} />
                        </span>
                        <span className="text-gray-700 transition-all duration-300 group-hover:text-gray-900">{sintoma}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-700 mt-6 italic">
                    Es importante recordar que estos síntomas pueden manifestarse de diferentes maneras en cada niño.
                  </p>
                </div>
              )}
              
              {activeTab === 'diagnostico' && (
                <div className="animate-fadeIn">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    El diagnóstico de la dislexia debe ser realizado por profesionales especializados como psicólogos educativos, logopedas o neuropsicólogos.
                  </p>
                  <p className="text-gray-700 mb-4 font-medium">El proceso suele incluir:</p>
                  <ul className="space-y-4 mb-6">
                    {[
                      "Evaluación de habilidades de lectura y escritura",
                      "Pruebas de procesamiento fonológico",
                      "Evaluación de la comprensión lectora",
                      "Test específicos para dislexia"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start bg-white shadow-sm hover:shadow rounded-lg p-3 transition-all duration-300 group">
                        <span className="text-[#809BCE] mr-3 mt-0.5 transform transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                          <CheckCircle size={22} />
                        </span>
                        <span className="text-gray-700 transition-all duration-300 group-hover:text-gray-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 bg-[#EAC4D5]/10 rounded-lg border-l-4 border-[#EAC4D5] mb-6">
                    <p className="text-gray-700 font-medium">
                      La detección temprana es clave para la intervención efectiva.
                    </p>
                  </div>
                  <div className="flex items-center mt-6 gap-2">
                    <Link
                      to="/test"
                      className="bg-[#809BCE] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#95B8D1] transition-all duration-300 flex items-center group shadow-md hover:shadow-lg transform hover:translate-y-[-2px]"
                    >
                      <span>Realizar test de evaluación</span>
                      <ChevronRight size={20} className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={`text-center transition-all duration-700 delay-600 ${
            infoIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <a href="#" className="inline-flex items-center text-[#809BCE] font-medium hover:text-[#95B8D1] group transition-all duration-300">
              <span>Más información sobre dislexia</span>
              <ChevronRight size={20} className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Características del programa */}
      <section
        ref={featuresRef}
        className={`py-20 bg-[#D6EADF]/20 transition-all duration-1000 ease-out ${
          featuresIsVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className={`text-center mb-16 transition-all duration-700 delay-200 ${
            featuresIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-black relative inline-block">
              Nuestro enfoque integral
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-[#fffff] rounded-full"></span>
            </h2>
            <p className="text-black/80 mt-6 max-w-2xl mx-auto text-lg">
              Combinamos tecnología, ciencia educativa y acompañamiento personalizado
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {caracteristicas.map((caracteristica, index) => (
              <div 
                key={index}
                className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 ${
                  featuresIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className={`p-4 ${caracteristica.color} rounded-full inline-flex items-center justify-center mb-5 text-[#809BCE]`}>
                  {caracteristica.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{caracteristica.title}</h3>
                <p className="text-black/70">{caracteristica.description}</p>
              </div>
            ))}
          </div>

          {/* Estadísticas animadas */}
          <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 delay-700 ${
            featuresIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {[
              { number: "90%", text: "de mejora en lectura tras 6 meses" },
              { number: "2000+", text: "niños ayudados en el último año" },
              { number: "100+", text: "especialistas en nuestra red" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-[#EAC4D5]/40 to-[#95B8D1]/40 p-6 rounded-xl text-center"
              >
                <h4 className="text-3xl font-bold text-[#809BCE] mb-2">{stat.number}</h4>
                <p className="text-black/80">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video section con efectos mejorados */}
      <section
        ref={videoRef}
        className={`py-24 bg-[#B8E0D2]/10 transition-all duration-1000 ease-out ${
          videoIsVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`text-center mb-16 transition-all duration-700 delay-200 ${
            videoIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 relative inline-block">
              Video recomendado
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-[#fffff] rounded-full"></span>
            </h2>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
              Conoce más sobre la dislexia en este video informativo
            </p>
          </div>
          
          <div className={`flex justify-center transition-all duration-700 delay-400 ${
            videoIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="w-full max-w-3xl mx-auto relative group">
              <div 
                className="rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500"
                style={{ 
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/frKqZ3-sQUE"
                  title="Video sobre dislexia"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full transition-transform duration-700 group-hover:scale-[1.01]"
                  style={{
                    borderRadius: "1rem",
                  }}
                ></iframe>
              </div>
              <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none"></div>
              
              {/* Play button overlay animado */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#809BCE]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <Play size={32} className="text-white ml-1" />
              </div>
            </div>
          </div>
          
          <div className={`mt-12 text-center transition-all duration-700 delay-600 ${
            videoIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <a href="#" className="inline-flex items-center text-[#809BCE] font-medium hover:text-[#95B8D1] group transition-all duration-300">
              <span>Ver más videos educativos</span>
              <ChevronRight size={20} className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA con efectos mejorados */}
      <section
        ref={ctaRef}
        className={`bg-gradient-to-r from-[#95B8D1] to-[#809BCE] py-20 transition-all duration-1000 ease-out ${
          ctaIsVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 max-w-4xl text-center relative">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 animate-pulse" style={{animationDuration: '6s'}}></div>
          
          <div className={`relative z-10 transition-all duration-700 delay-200 ${
            ctaIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              Comienza el camino hacia el éxito
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-10 text-black/90">
              Descubre cómo nuestro enfoque personalizado puede ayudar a tu hijo a superar los retos de la dislexia
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="bg-[#EAC4D5] text-black font-semibold px-8 py-4 rounded-lg hover:bg-[#D6EADF] transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group">
                <span>Ver mi progreso</span>
                <ArrowRight className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={18} />
              </button>
              <button className="border-2 border-black text-black font-semibold px-8 py-4 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group">
                <span>Explorar ejercicios</span>
                <ArrowRight className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={18} />
              </button>
            </div>
          </div>
          
          {/* Testimonios breves */}
          <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-700 delay-400 ${
            ctaIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {[
              { text: "Mi hijo ha mejorado su lectura notablemente en solo 3 meses.", author: "Ana M., madre" },
              { text: "El mejor programa que hemos encontrado después de años buscando ayuda.", author: "Carlos P., padre" },
              { text: "Los ejercicios son divertidos y mi hija los disfruta cada día.", author: "Laura S., madre" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 p-4 rounded-lg">
                <div className="text-yellow-300 flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="text-black/90 text-sm italic mb-2">"{testimonial.text}"</p>
                <p className="text-black/80 text-xs font-medium">— {testimonial.author}</p>
              </div>
              
            ))}
          </div>
        </div>
      </section>

      {/* Footer mejorado */}
      <footer
        ref={footerRef}
        className={`bg-[#809BCE] text-black py-16 transition-all duration-1000 ease-out ${
          footerIsVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className={`transition-all duration-700 delay-200 ${
              footerIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex items-center mb-4">
                <span className="text-white p-2 bg-blue-500/30 rounded-full"><Book size={24} /></span>
                <h2 className="ml-2 text-xl font-bold text-white">DislexiaAyuda</h2>
              </div>
              <p className="text-black/80">Soluciones efectivas e integrales para niños con dislexia, basadas en evidencia científica y adaptadas a cada necesidad.</p>
              
              <div className="mt-6 flex space-x-4">
                  {[
                    { icon: Facebook, href: "#", label: "facebook" },
                    { icon: Instagram, href: "#", label: "instagram" }, 
                    { icon: Twitter, href: "#", label: "twitter" },
                    { icon: Phone, href: "tel:+527122186324", label: "teléfono" }
                  ].map((social) => (
                    <a 
                      key={social.label} 
                      href={social.href} 
                      className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300 text-white"
                    >
                      <social.icon size={18} />
                      <span className="sr-only">{social.label}</span>
                    </a>
                  ))}
              </div>
            </div>
            
            {[
              {
                title: "Recursos",
                links: ["Guías para padres",  "Biblioteca de ejercicios"]
              },
              {
                title: "Acerca de",
                links: ["Nuestro equipo", "Metodología"]
              },
              {
                title: "Contacto",
                content: [
                  "info@dislexiaayuda.com",
                  "+52 7122186324",
                  "Mexico, Estado de Mexico"
                ]
              }
            ].map((column, columnIndex) => (
              <div 
                key={column.title}
                className={`transition-all duration-700 ${
                  footerIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${300 + columnIndex * 100}ms` }}
              >
                <h3 className="text-white font-bold mb-4 text-lg relative inline-block">
                  {column.title}
                  <span className="absolute bottom-0 left-0 h-0.5 w-12 bg-[#EAC4D5] rounded-full"></span>
                </h3>
                
                {column.links && (
                  <ul className="space-y-3">
                    {column.links.map((link, index) => (
                      <li key={index}>
                        <a href="#" className="text-black/80 hover:text-white transition-colors duration-300 flex items-center group">
                          <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span>{link}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                
                {column.content && (
                  <ul className="space-y-3">
                    {column.content.map((item, index) => (
                      <li key={index} className="text-black/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-black/80">
              © {new Date().getFullYear()} DislexiaAyuda. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}