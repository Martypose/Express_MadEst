import cv2 as cv
import numpy as np

# Lee la imagen de entrada
img = cv.imread('tablas.jpg', cv.IMREAD_GRAYSCALE)


# Definir las coordenadas de los cuatro puntos de la región de interés (ROI)
puntos_entrada = np.float32([[50,50], [150,50], [150,150], [50,150]])

# Definir las coordenadas de los cuatro puntos en los que se transformará la ROI
puntos_salida = np.float32([[0,0], [200,0], [200,200], [0,200]])

# Calcular la matriz de transformación de perspectiva
M = cv.getPerspectiveTransform(puntos_entrada, puntos_salida)

# Aplicar la transformación de perspectiva a la imagen
img_transformada = cv.warpPerspective(img, M, (200, 200))


cv.imwrite('imagentransformada.jpg', img_transformada)




img = cv.GaussianBlur(img, (3,3), 0)


# Aplica la binarización gaussiana
img_gaussian = cv.adaptiveThreshold(img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 5)

cv.imwrite('binarizacionGaussiana.jpg', img_gaussian)


kernel = np.ones((1,10), np.uint8)

morfo = cv.morphologyEx(img_gaussian, cv.MORPH_OPEN, kernel, iterations=3)
cv.imwrite('open.jpg', morfo)

kernel = np.ones((1,9), np.uint8)

morfo = cv.morphologyEx(img_gaussian, cv.MORPH_CLOSE, kernel, iterations=15)


cv.imwrite('close.jpg', morfo)

img_invertida = cv.bitwise_not(morfo)


# Definir el kernel estructurante para dilatación horizontal
kernel = np.ones((1, 4), np.uint8)

# Aplicar la operación de dilatación horizontal
img_dilated = cv.morphologyEx(img_invertida, cv.MORPH_DILATE, kernel,  iterations=1)
cv.imwrite('dilatacionhorizontal.jpg', img_dilated)





# Guarda la imagen con los rectángulos dibujados
cv.imwrite('tabla_detectada.jpg', img)
