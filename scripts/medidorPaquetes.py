import json
import base64
import cv2 as cv
import numpy as np
import sys

from matplotlib import pyplot as plt
import pylab # this allows you to control figure size 
# pylab.rcParams['figure.figsize'] = (10.0, 8.0) # this controls figure size in the notebook
# imagen original
img1 = cv.imread("tablas.jpg")

morfo = cv.cvtColor(img1, cv.COLOR_BGR2GRAY)

# imagen gris
plt.imshow(morfo, cmap="gray")
	
# cv.imwrite('Test_gray.jpg', img2) 
# descomposicion en canales hsv
img3 = cv.cvtColor(img1, cv.COLOR_BGR2HSV)
v = img1[:,:,2]
s = img1[:,:,1]
h = img1[:,:,0]

fig, (ax1, ax2, ax3) = plt.subplots(1, 3)
fig.suptitle("Canales HSV")
ax1.imshow(h, cmap="gray", vmin=0, vmax=255)
ax2.imshow(s, cmap="gray", vmin=0, vmax=255)
ax3.imshow(v, cmap="gray", vmin=0, vmax=255)
# plt.show()

cv.imwrite('canalH.jpg', h)

# def procesar_imagen(imagen_path):
#     imagen = cv2.imread(imagen_path)
#     # Realiza aquí tus operaciones de procesamiento de imágenes
#     resultados = {"datos": "Algunos datos"}
    
#     # Codifica la imagen como una cadena base64
#     imagen_codificada = cv2.imencode('.jpg', imagen)[1].tobytes()
#     imagen_codificada = base64.b64encode(imagen_codificada).decode('utf-8')
#     resultados["imagen_resultante"] = imagen_codificada
    
#     return resultados

# Recibe la imagen y la procesa
# imagen_path = sys.argv[1]
# resultados = procesar_imagen(imagen_path)

# Devuelve los resultados en formato JSON
# print(json.dumps(resultados))


# blur gaussiano
gris = cv.GaussianBlur(v, (1,3), 5)
# binarizacion
# sobelx = cv.Sobel(gris, cv.CV_64F, 1, 0, ksize=5)
th3 = cv.adaptiveThreshold(gris,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY,33,5)

plt.imshow(th3)
cv.imwrite('bluryBin.jpg', th3)


kernel = np.ones((1,2), np.uint8)

erode = cv.erode(th3, kernel, iterations=1)

kernel = np.ones((2,1), np.uint8)
erode = cv.dilate(erode, kernel, iterations=1)
cv.imwrite('erode.jpg', erode)
kernel = np.ones((1,2), np.uint8)

morfo = cv.morphologyEx(erode, cv.MORPH_OPEN, kernel, iterations=5)

kernel = np.ones((3,1), np.uint8)

erode = cv.erode(morfo, kernel, iterations=2)

kernel = np.ones((1,3), np.uint8)

morfo = cv.morphologyEx(erode, cv.MORPH_OPEN, kernel, iterations=2)


kernel = np.ones((5,1), np.uint8)

erode = cv.dilate(morfo, kernel, iterations=1)
cv.imwrite('open33.jpg', erode)




print("Hola mundo")