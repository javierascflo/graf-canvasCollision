const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

// Fondo oscuro inicial para el canvas
canvas.style.background = "#0b0f19";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color; // Guarda el color aleatorio inicial
        this.text = text;
        this.speed = speed;
        // Direcciones aleatorias iniciales basadas en la velocidad
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.flashTimer = 0; // Temporizador para el efecto de destello en colisión
    }

    draw(context) {
        context.save();
        context.beginPath();

        // Efecto de brillo / neón (Glow)
        context.shadowBlur = 18;
        context.shadowColor = this.color;

        // Relleno semitransparente del círculo
        context.fillStyle = this.color;
        context.globalAlpha = 0.7;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();

        // Borde exterior brillante
        context.lineWidth = 3;
        context.strokeStyle = this.color;
        context.globalAlpha = 1.0;
        context.stroke();
        context.closePath();

        // Texto central estilizado y legible en blanco
        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 15px sans-serif";
        context.fillText(this.text, this.posX, this.posY);

        context.restore();
    }

    update(context) {
        // Manejar el efecto visual de "flash" eléctrico al colisionar
        if (this.flashTimer > 0) {
            this.color = "#00f3ff"; // Azul neón brillante durante la colisión
            this.flashTimer--;
        } else {
            this.color = this.originalColor; // Regresa al color original
        }

        this.draw(context);
        
        // Actualizar la posición X y rebotar en los bordes del canvas
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        
        // Actualizar la posición Y y rebotar en los bordes del canvas
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }

    // Método para detectar colisión usando la fórmula de distancia entre centros
    checkCollision(otherCircle) {
        let dx = this.posX - otherCircle.posX;
        let dy = this.posY - otherCircle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherCircle.radius);
    }

    // Método de P.O.O. para gestionar el rebote físico y la activación del flash
    resolveCollision(otherCircle) {
        let dx = otherCircle.posX - this.posX;
        let dy = otherCircle.posY - this.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let minDist = this.radius + otherCircle.radius;

        if (distance < minDist) {
            // 1. Corrección de superposición para evitar que se queden pegados
            let overlap = minDist - distance;
            let nx = dx / distance;
            let ny = dy / distance;

            this.posX -= nx * overlap * 0.5;
            this.posY -= ny * overlap * 0.5;
            otherCircle.posX += nx * overlap * 0.5;
            otherCircle.posY += ny * overlap * 0.5;

            // 2. Rebote físico: intercambio de impulso normal
            let kx = this.dx - otherCircle.dx;
            let ky = this.dy - otherCircle.dy;
            let p = 2 * (nx * kx + ny * ky) / 2;

            this.dx -= p * nx;
            this.dy -= p * ny;
            otherCircle.dx += p * nx;
            otherCircle.dy += p * ny;

            // 3. Activar el efecto de destello azul brillante (durante 25 fotogramas)
            this.flashTimer = 25;
            otherCircle.flashTimer = 25;
        }
    }
}

// Crear un array para almacenar los círculos
let circles = [];

// Función para generar 20 círculos con velocidades entre 1 y 5
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 25 + 20; // Radio entre 20 y 45
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        
        // Generar colores brillantes/vibrantes para el estilo neón
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; 
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        let text = `C${i + 1}`; // Etiqueta del círculo
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para animar los círculos con efecto de rastro (Motion Blur)
function animate() {
    // Dibujar un rectángulo semi-transparente sobre el canvas en cada frame para crear estelas fluidas
    ctx.fillStyle = 'rgba(11, 15, 25, 0.3)';
    ctx.fillRect(0, 0, window_width, window_height);

    // Comprobar y resolver colisiones y rebotes entre todos los pares de círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].checkCollision(circles[j])) {
                circles[i].resolveCollision(circles[j]);
            }
        }
    }

    // Actualizar cada círculo (gestiona el flash, movimiento y redibujado)
    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate); // Repetir la animación
}

// Generar 20 círculos y comenzar la animación
generateCircles(20); 
animate();