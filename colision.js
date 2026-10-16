const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

// Variables del juego
let score = 0;
let totalObjects = 25;
let objects = [];
let particles = []; // Arreglo para almacenar las partículas de la explosión

// Cargar imagen de la cancha de básquetbol para el fondo
const bgImage = new Image();
bgImage.src = 'img/lakers.jpeg';

// Imagen del balón de básquetbol
const objImage = new Image();
objImage.src = 'https://png.pngtree.com/png-clipart/20230820/ourmid/pngtree-basketball-basketball-png-image_9187111.png';

// Clase para gestionar las partículas de la explosión
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.alpha = 1.0; 
        this.decay = Math.random() * 0.03 + 0.02; 
        this.size = Math.random() * 6 + 3; 
        const colors = ["#ff5500", "#ffaa00", "#ff0044", "#ffff00"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay; 
    }

    draw(context) {
        context.save();
        context.globalAlpha = Math.max(this.alpha, 0);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}

class FallingObject {
    constructor(size) {
        this.size = size;
        this.resetProperties();
    }

    resetProperties() {
        this.x = Math.random() * (window_width - this.size);
        this.y = -this.size - Math.random() * 300; 
        this.vx = (Math.random() - 0.5) * 3; 

        let speedMultiplier = 1;
        if (score > 20) {
            speedMultiplier = 2.2; 
        } else if (score > 10) {
            speedMultiplier = 1.5; 
        }

        this.vy = (Math.random() * 2 + 1) * speedMultiplier; 
        this.gravity = 0.25 * speedMultiplier;
        this.bounce = 0.6; 
    }

    update() {
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        if (this.x < 0 || this.x + this.size > window_width) {
            this.vx = -this.vx;
        }

        let floor = window_height - this.size;
        if (this.y >= floor) {
            this.y = floor;
            this.vy = -this.vy * this.bounce; 

            if (Math.abs(this.vy) < 1.2) {
                this.resetProperties();
            }
        }
    }

    draw(context) {
        context.save();
        if (objImage.complete && objImage.naturalHeight !== 0) {
            context.drawImage(objImage, this.x, this.y, this.size, this.size);
        } else {
            context.fillStyle = "#ff6600";
            context.beginPath();
            context.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
            context.fill();
        }
        context.restore();
    }

    isClicked(mouseX, mouseY) {
        let centerX = this.x + this.size / 2;
        let centerY = this.y + this.size / 2;
        let dx = mouseX - centerX;
        let dy = mouseY - centerY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.size / 2;
    }
}

function initObjects() {
    objects = [];
    for (let i = 0; i < totalObjects; i++) {
        let size = 70;
        objects.push(new FallingObject(size));
    }
}

window.addEventListener("click", (event) => {
    if (event.button === 0) { 
        let mouseX = event.clientX;
        let mouseY = event.clientY;

        for (let i = 0; i < objects.length; i++) {
            if (objects[i].isClicked(mouseX, mouseY)) {
                score++; 
                
                let centerX = objects[i].x + objects[i].size / 2;
                let centerY = objects[i].y + objects[i].size / 2;
                for (let p = 0; p < 18; p++) {
                    particles.push(new Particle(centerX, centerY));
                }

                objects[i].resetProperties(); 
                break;
            }
        }
    }
});

function animate() {
    // Dibujar la imagen de la cancha de básquetbol como fondo (con respaldo de color si la imagen carga tarde)
    if (bgImage.complete && bgImage.naturalHeight !== 0) {
        ctx.drawImage(bgImage, 0, 0, window_width, window_height);
    } else {
        ctx.fillStyle = "#d28c4e";
        ctx.fillRect(0, 0, window_width, window_height);
    }

    // Actualizar y dibujar cada uno de los 25 objetos
    objects.forEach(obj => {
        obj.update();
        obj.draw(ctx);
    });

    // Actualizar y dibujar las partículas de la explosión
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    // Dibujar el panel del contador en la parte superior derecha
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(window_width - 230, 20, 210, 55);
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 2;
    ctx.strokeRect(window_width - 230, 20, 210, 55);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`Eliminados: ${score}`, window_width - 40, 52);
    ctx.restore();

    requestAnimationFrame(animate);
}

// Iniciar aplicación
initObjects();
animate();