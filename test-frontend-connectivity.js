// Script de prueba para verificar la conectividad con las carreras
// Ejecutar en la consola del navegador

async function testCarreras() {
  console.log('🧪 Probando conexión con carreras...');
  
  try {
    const response = await fetch('http://localhost:3004/api/carreras');
    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const carreras = await response.json();
    console.log('✅ Carreras obtenidas:', carreras.length);
    console.log('📋 Lista de carreras:');
    carreras.forEach((carrera, index) => {
      console.log(`${index + 1}. ${carrera.nombre}`);
    });
    
    return carreras;
  } catch (error) {
    console.error('❌ Error al obtener carreras:', error);
    return null;
  }
}

// Probar también semestres
async function testSemestres() {
  console.log('🧪 Probando conexión con semestres...');
  
  try {
    const response = await fetch('http://localhost:3004/api/semestres');
    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const semestres = await response.json();
    console.log('✅ Semestres obtenidos:', semestres.length);
    console.log('📋 Lista de semestres:');
    semestres.forEach((semestre) => {
      console.log(`${semestre.numero}. ${semestre.descripcion}`);
    });
    
    return semestres;
  } catch (error) {
    console.error('❌ Error al obtener semestres:', error);
    return null;
  }
}

// Ejecutar ambas pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de conectividad...');
  console.log('=' .repeat(50));
  
  await testCarreras();
  console.log('');
  await testSemestres();
  
  console.log('');
  console.log('🎯 Si ves errores CORS, verifica que:');
  console.log('1. El servidor esté en puerto 3004');
  console.log('2. El frontend esté en puerto 5173');
  console.log('3. No haya bloqueos de firewall');
}

// Ejecutar las pruebas
runTests();
