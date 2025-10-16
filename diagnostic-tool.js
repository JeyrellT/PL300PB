/**
 * 🔧 HERRAMIENTA DE DIAGNÓSTICO EN VIVO
 * Ejecutar en la consola del navegador para diagnosticar el problema
 */

// 1️⃣ Verificar localStorage
console.log('=== 1. VERIFICACIÓN DE LOCALSTORAGE ===');
const localStorageKeys = Object.keys(localStorage);
console.log('Claves totales:', localStorageKeys.length);

const cxcKeys = localStorageKeys.filter(k => k.includes('cxc'));
const pl300Keys = localStorageKeys.filter(k => k.includes('pl300'));

console.log('🎮 Claves CxC:', cxcKeys);
console.log('🎯 Claves PL300:', pl300Keys);

cxcKeys.forEach(key => {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`\n📦 ${key}:`, {
            totalPoints: data?.progress?.totalPoints || data?.totalPoints || 0,
            answeredQuestions: data?.progress?.answeredQuestions?.length || data?.answeredQuestions?.length || 0,
            questionTracking: Object.keys(data?.progress?.questionTracking || data?.questionTracking || {}).length
        });
    } catch (e) {
        console.log(`❌ Error parseando ${key}:`, e.message);
    }
});

pl300Keys.forEach(key => {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`\n📦 ${key}:`, {
            totalXP: data?.profile?.progress?.totalXP || data?.progress?.totalXP || 0,
            questionsAnswered: data?.profile?.progress?.questionsAnswered || data?.progress?.questionsAnswered || 0
        });
    } catch (e) {
        console.log(`❌ Error parseando ${key}:`, e.message);
    }
});

// 2️⃣ Verificar IndexedDB
console.log('\n=== 2. VERIFICACIÓN DE INDEXEDDB ===');
const checkIndexedDB = async () => {
    const dbs = await indexedDB.databases();
    console.log('Bases de datos:', dbs.map(db => db.name));
    
    // Verificar cxcc_app_v1
    try {
        const request = indexedDB.open('cxcc_app_v1');
        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('✅ cxcc_app_v1 encontrada');
            console.log('Object stores:', Array.from(db.objectStoreNames));
            db.close();
        };
        request.onerror = () => {
            console.log('❌ Error abriendo cxcc_app_v1');
        };
    } catch (e) {
        console.log('❌ cxcc_app_v1 no existe');
    }
};
checkIndexedDB();

// 3️⃣ Simular respuesta de pregunta
console.log('\n=== 3. SIMULACIÓN DE RESPUESTA ===');
console.log(`
Para simular una respuesta, ejecuta en la consola:

// Opción A: Usar el contexto directamente (si está disponible)
window.__simulateAnswer = () => {
    const event = new CustomEvent('simulateQuizComplete', {
        detail: {
            questions: [{id: 'test_001', dominio: 'Test', nivel: 'Fácil', respuestaCorrecta: 0}],
            answers: [0],
            timeElapsed: 30
        }
    });
    window.dispatchEvent(event);
};

// Opción B: Agregar datos directamente a localStorage
window.__addTestAnswer = () => {
    const cxcKey = 'cxcc_progress_head';
    const data = JSON.parse(localStorage.getItem(cxcKey) || '{}');
    
    if (!data.progress) data.progress = {};
    if (!data.progress.answeredQuestions) data.progress.answeredQuestions = [];
    if (!data.progress.questionTracking) data.progress.questionTracking = {};
    
    const testId = 'test_' + Date.now();
    data.progress.answeredQuestions.push(testId);
    data.progress.questionTracking[testId] = {
        totalAttempts: 1,
        correctAttempts: 1,
        incorrectAttempts: 0,
        lastAttemptDate: new Date().toISOString()
    };
    data.progress.totalPoints = (data.progress.totalPoints || 0) + 10;
    data.progress.totalXP = (data.progress.totalXP || 0) + 10;
    
    localStorage.setItem(cxcKey, JSON.stringify(data));
    console.log('✅ Respuesta test agregada. Recarga la página.');
    return data;
};

Ejecuta: __addTestAnswer()
`);

// 4️⃣ Verificar React DevTools
console.log('\n=== 4. VERIFICACIÓN DE REACT CONTEXT ===');
console.log(`
Si tienes React DevTools instalado:
1. Abre el panel "Components"
2. Busca "CxCProgressProvider"
3. Verifica el estado "progress"
4. Busca "ProfileScreen"
5. Verifica las props "stats"

Deberías ver:
- progress.answeredQuestions: [] (vacío o con IDs)
- progress.totalPoints: número
- progress.questionTracking: {} (vacío o con datos)
`);

// 5️⃣ Verificar eventos del navegador
console.log('\n=== 5. ESCUCHAR EVENTOS DE STORAGE ===');
window.addEventListener('storage', (e) => {
    console.log('🔄 Storage event detectado:', {
        key: e.key,
        oldValue: e.oldValue?.substring(0, 100) + '...',
        newValue: e.newValue?.substring(0, 100) + '...'
    });
});

console.log('✅ Listener de storage activado');

// 6️⃣ Función helper para limpiar y reiniciar
window.__resetAndRestart = () => {
    console.log('🗑️ Limpiando todo...');
    
    // Limpiar localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.includes('cxc') || key.includes('pl300')) {
            localStorage.removeItem(key);
        }
    });
    
    // Limpiar IndexedDB
    indexedDB.deleteDatabase('cxcc_app_v1');
    indexedDB.deleteDatabase('pl300_db');
    
    console.log('✅ Storage limpiado. Recargando...');
    setTimeout(() => location.reload(), 1000);
};

console.log(`
=== 🎯 FUNCIONES DISPONIBLES ===
- __addTestAnswer()     : Agregar respuesta de prueba
- __resetAndRestart()   : Limpiar todo y reiniciar
- __simulateAnswer()    : Simular evento de quiz completado
`);

export {};
