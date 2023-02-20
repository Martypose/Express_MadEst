import cv2 as cv
import numpy as np

# Lee la imagen de entrada
img = cv.imread('imagen.jpg', cv.IMREAD_GRAYSCALE)

# Aplica la binarización gaussiana
img_gaussian = cv.adaptiveThreshold(img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2)

# Aplica el filtro Sobel para resaltar los bordes
img_sobel = cv.Sobel(img_gaussian, cv.CV_8U, 1, 0)

# Detecta las líneas en la imagen
lines = cv.HoughLinesP(img_sobel, rho=1, theta=np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)

# Itera sobre las líneas detectadas
for line in lines:
    x1, y1, x2, y2 = line[0]

    # Descarta líneas no horizontales ni verticales
    if abs(x2 - x1) > abs(y2 - y1):
        # Línea vertical
        cv.line(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    else:
        # Línea horizontal
        cv.line(img, (x1, y1), (x2, y2), (0, 0, 255), 2)

        # Si la línea no es recta, hazla crecer
        if abs(x2 - x1) < 0.9 * abs(y2 - y1):
            if x1 < x2:
                new_x1 = x1 - 10
                new_x2 = x2 + 10
            else:
                new_x1 = x1 + 10
                new_x2 = x2 - 10

            cv.line(img, (new_x1, y1), (new_x2, y2), (0, 0, 255), 2)

# Guarda la imagen con los rectángulos dibujados
cv.imwrite('tabla_detectada.jpg', img)
