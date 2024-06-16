import {draw} from "./modules/draw.js"

function setupCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    ctx.imageSmoothingEnabled = false;
}

