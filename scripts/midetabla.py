import cv2 as cv
import numpy as np
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")

def enviar_medidas(medidas):
    socketio.emit("medidas", medidas)

def procesar_video(captura):
    while True:
        ret, frame = captura.read()
        if not ret:
            break

        contornos = detectar_objetos(frame)
        guardar_medidas(contornos)

        cv.imshow("Resultado", frame)

        if cv.waitKey(1) & 0xFF == ord("q"):
            break

def detectar_objetos(imagen):
    hsv = cv.cvtColor(imagen, cv.COLOR_BGR2HSV)
    sat = hsv[:,:,2]
    grises = sat

    grises = cv.GaussianBlur(grises, (3,3), 0)

    binarizacion_global = cv.threshold(grises, 200, 255, cv.THRESH_BINARY)[1]

    kernel = np.ones((3,3), np.uint8)
    dilate = cv.dilate(binarizacion_global, kernel, iterations=1)

    erode = cv.erode(dilate, kernel, iterations=1)
    dilate = cv.erode(erode, kernel, iterations=1)
    erode = cv.erode(dilate, kernel, iterations=1)

    kernel = cv.getStructuringElement(cv.MORPH_RECT, (13, 13))
    opening = cv.morphologyEx(erode, cv.MORPH_OPEN, kernel, iterations=4)

    cnts, _ = cv.findContours(opening, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    return cnts

def guardar_medidas(contornos):
    medidas = []

    for c in contornos:
        area = cv.contourArea(c)
        x, y, w, h = cv.boundingRect(c)
        aspect_ratio = float(w) / h

        if aspect_ratio > 3 and 100 < h < 200 and x > 200:
            medidas.append((x, y, w, h))

    enviar_medidas(medidas)

def main():
    captura = cv.VideoCapture(0)
    if not captura.isOpened():
        print("Error al abrir la cámara.")
        return

    try:
        procesar_video(captura)
    finally:
        captura.release()
        cv.destroyAllWindows()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)