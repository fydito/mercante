fetch('frases.json')
  .then(response => response.json())
  .then(frases => {
    const aleatoria = frases[Math.floor(Math.random() * frases.length)];
    document.getElementById('frase-titulo').textContent = aleatoria.titulo;
    document.getElementById('frase-texto').textContent = aleatoria.texto;
  })
  .catch(error => console.error('Error al cargar las frases:', error));
