// Add a subtle animated starfield background for cinematic effect
(function addStarfield() {
  if (document.getElementById('starfield')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'starfield';
  document.body.appendChild(canvas);
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  const ctx = canvas.getContext('2d');
  const stars = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.2 + 0.3,
    s: Math.random() * 0.5 + 0.1,
    o: Math.random() * 0.5 + 0.3
  }));
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (const star of stars) {
      ctx.globalAlpha = star.o + 0.2 * Math.sin(Date.now()/900 + star.x);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, 2*Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
      ctx.fill();
      star.x += star.s * 0.1;
      if (star.x > canvas.width) star.x = 0;
    }
    requestAnimationFrame(animate);
  }
  animate();
})();
