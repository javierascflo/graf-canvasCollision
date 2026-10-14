const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color; // Almacena el color original para restaurarlo después
        this.text = text;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
        this.isColliding = false; // Atributo para verificar el estado de colisión
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);
        
        // Actualizar la posición X
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        
        // Actualizar la posición Y
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }

    // Método para detectar colisión con otro círculo usando la fórmula de distancia entre centros
    checkCollision(otherCircle) {
        let dx = this.posX - otherCircle.posX;
        let dy = this.posY - otherCircle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Si la distancia es menor a la suma de los radios, hay colisión
        return distance < (this.radius + otherCircle.radius);
    }
}

// Crear un array para almacenar los círculos
let circles = [];

// Función para generar 20 círculos con velocidades entre 1 y 5
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        let text = `C${i + 1}`; // Etiqueta del círculo
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para animar los círculos y gestionar colisiones
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas[cite: 1]

    // Restablecer el estado de colisión de cada círculo al inicio de cada fotograma
    circles.forEach(circle => {
        circle.isColliding = false;
    });

    // Comprobar colisiones entre cada par de círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].checkCollision(circles[j])) {
                circles[i].isColliding = true;
                circles[j].isColliding = true;
            }
        }
    }

    // Actualizar colores y posiciones de los círculos
    circles.forEach(circle => {
        if (circle.isColliding) {
            circle.color = "#0000FF"; // Azul durante la colisión
        } else {
            circle.color = circle.originalColor; // Regresa a su color original al terminar
        }
        circle.update(ctx); // Actualizar cada círculo[cite: 1]
    });

    requestAnimationFrame(animate); // Repetir la animación[cite: 1]
}

// Generar 20 círculos y comenzar la animación
generateCircles(20); 
animate();