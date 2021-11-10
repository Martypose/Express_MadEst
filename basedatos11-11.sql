-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: localhost    Database: madeirasestanqueiro
-- ------------------------------------------------------
-- Server version	8.0.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avisos`
--

DROP TABLE IF EXISTS `avisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8_bin NOT NULL,
  `telefono` varchar(50) COLLATE utf8_bin NOT NULL,
  `localizacion` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `especies` varchar(50) COLLATE utf8_bin NOT NULL,
  `observaciones` text COLLATE utf8_bin NOT NULL,
  `fecha` varchar(50) COLLATE utf8_bin NOT NULL,
  `vista` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos`
--

LOCK TABLES `avisos` WRITE;
/*!40000 ALTER TABLE `avisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calidad`
--

DROP TABLE IF EXISTS `calidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calidad` (
  `calidad` varchar(50) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`calidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calidad`
--

LOCK TABLES `calidad` WRITE;
/*!40000 ALTER TABLE `calidad` DISABLE KEYS */;
/*!40000 ALTER TABLE `calidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `cif` varchar(11) COLLATE utf8_bin NOT NULL,
  `nombre` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8_bin NOT NULL,
  `telefono` varchar(100) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`cif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conductor`
--

DROP TABLE IF EXISTS `conductor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conductor` (
  `DNI` varchar(11) COLLATE utf8_bin NOT NULL,
  `nombre` varchar(100) COLLATE utf8_bin NOT NULL,
  `firma` varchar(200) COLLATE utf8_bin NOT NULL,
  `transportista` varchar(11) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`DNI`),
  KEY `transportista` (`transportista`),
  CONSTRAINT `conductor_ibfk_1` FOREIGN KEY (`transportista`) REFERENCES `transportista` (`cif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conductor`
--

LOCK TABLES `conductor` WRITE;
/*!40000 ALTER TABLE `conductor` DISABLE KEYS */;
/*!40000 ALTER TABLE `conductor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `estado` varchar(50) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `ID` int NOT NULL,
  `idpedidomadera` int DEFAULT NULL,
  `idpedidobiocombustible` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `idpedidomadera` (`idpedidomadera`),
  KEY `idpedidobiocombustible` (`idpedidobiocombustible`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`idpedidomadera`) REFERENCES `pedidosmadera` (`ID`),
  CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`idpedidobiocombustible`) REFERENCES `pedidosbiocombustible` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maestro`
--

DROP TABLE IF EXISTS `maestro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maestro` (
  `id` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `valor` varchar(100) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maestro`
--

LOCK TABLES `maestro` WRITE;
/*!40000 ALTER TABLE `maestro` DISABLE KEYS */;
/*!40000 ALTER TABLE `maestro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medidas`
--

DROP TABLE IF EXISTS `medidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medidas` (
  `id` varchar(100) COLLATE utf8_bin NOT NULL,
  `ancho` int DEFAULT NULL,
  `grosor` int DEFAULT NULL,
  `largo` int DEFAULT NULL,
  `esMedible` tinyint(1) NOT NULL DEFAULT (0),
  `barroteado` tinyint(1) DEFAULT '1',
  `homogeneo` tinyint(1) DEFAULT '0',
  `calidad` varchar(50) COLLATE utf8_bin DEFAULT 'Normal',
  PRIMARY KEY (`id`),
  KEY `fk_calidad` (`calidad`),
  CONSTRAINT `fk_calidad` FOREIGN KEY (`calidad`) REFERENCES `calidad` (`calidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medidas`
--

LOCK TABLES `medidas` WRITE;
/*!40000 ALTER TABLE `medidas` DISABLE KEYS */;
/*!40000 ALTER TABLE `medidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paquete`
--

DROP TABLE IF EXISTS `paquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paquete` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `fechaCreacion` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `estado` varchar(50) COLLATE utf8_bin NOT NULL,
  `cantidades` varchar(2000) COLLATE utf8_bin DEFAULT NULL,
  `cubico` double(4,3) DEFAULT NULL,
  `numpiezas` int DEFAULT NULL,
  `medida` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `fechaBajado` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `fechaVenta` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `estado` (`estado`),
  KEY `medida_key` (`medida`),
  CONSTRAINT `paquete_ibfk_1` FOREIGN KEY (`estado`) REFERENCES `estado` (`estado`),
  CONSTRAINT `paquete_ibfk_3` FOREIGN KEY (`medida`) REFERENCES `medidas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paquete`
--

LOCK TABLES `paquete` WRITE;
/*!40000 ALTER TABLE `paquete` DISABLE KEYS */;
/*!40000 ALTER TABLE `paquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidopaquete`
--

DROP TABLE IF EXISTS `pedidopaquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidopaquete` (
  `id_pedido` int NOT NULL,
  `id_paquete` int NOT NULL,
  PRIMARY KEY (`id_pedido`,`id_paquete`),
  UNIQUE KEY `id_paquete` (`id_paquete`),
  CONSTRAINT `pedidopaquete_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidosmadera` (`ID`),
  CONSTRAINT `pedidopaquete_ibfk_2` FOREIGN KEY (`id_paquete`) REFERENCES `paquete` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidopaquete`
--

LOCK TABLES `pedidopaquete` WRITE;
/*!40000 ALTER TABLE `pedidopaquete` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidopaquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidosbiocombustible`
--

DROP TABLE IF EXISTS `pedidosbiocombustible`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidosbiocombustible` (
  `ID` int NOT NULL,
  `tipo` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `transportista` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  `conductor` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  `cliente` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  `cantidad` float(4,2) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `transportista` (`transportista`),
  KEY `conductor` (`conductor`),
  KEY `cliente` (`cliente`),
  KEY `tipo` (`tipo`),
  CONSTRAINT `pedidosbiocombustible_ibfk_1` FOREIGN KEY (`transportista`) REFERENCES `transportista` (`cif`) ON DELETE RESTRICT,
  CONSTRAINT `pedidosbiocombustible_ibfk_2` FOREIGN KEY (`conductor`) REFERENCES `conductor` (`DNI`) ON DELETE RESTRICT,
  CONSTRAINT `pedidosbiocombustible_ibfk_3` FOREIGN KEY (`cliente`) REFERENCES `cliente` (`cif`),
  CONSTRAINT `pedidosbiocombustible_ibfk_4` FOREIGN KEY (`tipo`) REFERENCES `tiposbiocombustible` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidosbiocombustible`
--

LOCK TABLES `pedidosbiocombustible` WRITE;
/*!40000 ALTER TABLE `pedidosbiocombustible` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidosbiocombustible` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidosmadera`
--

DROP TABLE IF EXISTS `pedidosmadera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidosmadera` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `fechaEnvio` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `cliente` varchar(11) COLLATE utf8_bin NOT NULL,
  `transportista` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  `conductor` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_pedidoMaderacliente` (`cliente`),
  KEY `FK_pedidoMaderatransportista` (`transportista`),
  KEY `FK_pedidoMaderaconductor` (`conductor`),
  CONSTRAINT `FK_pedidoMaderacliente` FOREIGN KEY (`cliente`) REFERENCES `cliente` (`cif`),
  CONSTRAINT `FK_pedidoMaderaconductor` FOREIGN KEY (`conductor`) REFERENCES `conductor` (`DNI`),
  CONSTRAINT `FK_pedidoMaderatransportista` FOREIGN KEY (`transportista`) REFERENCES `transportista` (`cif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidosmadera`
--

LOCK TABLES `pedidosmadera` WRITE;
/*!40000 ALTER TABLE `pedidosmadera` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidosmadera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `Direccion` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `Localidad` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `Provincia` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `CodigoPostal` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `Telefono` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `E-mail` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `Movil` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `NIF` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esEmpresa` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `RazonSocial` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esVendedor` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esComprador` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esCliente` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esProveedor` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esEmpleado` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esOperario` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esCortador` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esObrero` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esTransportista` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esTasador` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `esSacador` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `Mote` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preciosbiocombustible`
--

DROP TABLE IF EXISTS `preciosbiocombustible`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preciosbiocombustible` (
  `tipobiocombustible` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `cliente` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  `precio` float DEFAULT NULL,
  KEY `tipobiocombustible` (`tipobiocombustible`),
  KEY `cliente` (`cliente`),
  CONSTRAINT `preciosbiocombustible_ibfk_1` FOREIGN KEY (`tipobiocombustible`) REFERENCES `tiposbiocombustible` (`nombre`),
  CONSTRAINT `preciosbiocombustible_ibfk_2` FOREIGN KEY (`cliente`) REFERENCES `cliente` (`cif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preciosbiocombustible`
--

LOCK TABLES `preciosbiocombustible` WRITE;
/*!40000 ALTER TABLE `preciosbiocombustible` DISABLE KEYS */;
/*!40000 ALTER TABLE `preciosbiocombustible` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preciosmadera`
--

DROP TABLE IF EXISTS `preciosmadera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preciosmadera` (
  `medida` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `cliente` varchar(11) COLLATE utf8_bin DEFAULT NULL,
  `precio` float DEFAULT NULL,
  KEY `medida` (`medida`),
  KEY `cliente` (`cliente`),
  CONSTRAINT `preciosmadera_ibfk_1` FOREIGN KEY (`medida`) REFERENCES `medidas` (`id`),
  CONSTRAINT `preciosmadera_ibfk_2` FOREIGN KEY (`cliente`) REFERENCES `cliente` (`cif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preciosmadera`
--

LOCK TABLES `preciosmadera` WRITE;
/*!40000 ALTER TABLE `preciosmadera` DISABLE KEYS */;
/*!40000 ALTER TABLE `preciosmadera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiposbiocombustible`
--

DROP TABLE IF EXISTS `tiposbiocombustible`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposbiocombustible` (
  `nombre` varchar(100) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiposbiocombustible`
--

LOCK TABLES `tiposbiocombustible` WRITE;
/*!40000 ALTER TABLE `tiposbiocombustible` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiposbiocombustible` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transportista`
--

DROP TABLE IF EXISTS `transportista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transportista` (
  `cif` varchar(11) COLLATE utf8_bin NOT NULL,
  `nombre` varchar(100) COLLATE utf8_bin NOT NULL,
  `direccion` varchar(200) COLLATE utf8_bin NOT NULL,
  `telefono` varchar(100) COLLATE utf8_bin NOT NULL,
  `firma` varchar(200) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`cif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transportista`
--

LOCK TABLES `transportista` WRITE;
/*!40000 ALTER TABLE `transportista` DISABLE KEYS */;
/*!40000 ALTER TABLE `transportista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertype`
--

DROP TABLE IF EXISTS `usertype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usertype` (
  `tipo` varchar(50) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertype`
--

LOCK TABLES `usertype` WRITE;
/*!40000 ALTER TABLE `usertype` DISABLE KEYS */;
/*!40000 ALTER TABLE `usertype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8_bin NOT NULL,
  `password` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `usertype` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT 'apuntador',
  PRIMARY KEY (`id`),
  KEY `usuarios_ibfk_1` (`usertype`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`usertype`) REFERENCES `usertype` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb3 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-11-11  0:04:27
