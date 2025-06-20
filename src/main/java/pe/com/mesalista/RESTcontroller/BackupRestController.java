package pe.com.mesalista.RESTcontroller;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.com.mesalista.config.BackupConfig;

@RestController
@RequestMapping("/api/reportes-backup-db")
public class BackupRestController {

	@Autowired
	private BackupConfig backupConfig;

	@GetMapping("/exportar")
	public ResponseEntity<Resource> exportarBaseDeDatos() {
		try {
			String usuario = backupConfig.getUser();
			String clave = backupConfig.getPassword();
			String baseDeDatos = backupConfig.getDatabase();

			ProcessBuilder pb = new ProcessBuilder("mysqldump", "-u" + usuario, "-p" + clave, "--databases",
					baseDeDatos);

			Process proceso = pb.start();

			ByteArrayOutputStream backupOutput = new ByteArrayOutputStream();
			try (InputStream is = proceso.getInputStream()) {
				is.transferTo(backupOutput);
			}

			int exitCode = proceso.waitFor();
			if (exitCode != 0) {
				return ResponseEntity.internalServerError()
						.body(new ByteArrayResource(("mysqldump falló con código " + exitCode).getBytes()));
			}

			ByteArrayResource resource = new ByteArrayResource(backupOutput.toByteArray());

			String filename = "backup_mesalista_"
					+ LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".sql";

			return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
					.contentType(MediaType.APPLICATION_OCTET_STREAM).contentLength(resource.contentLength())
					.body(resource);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError()
					.body(new ByteArrayResource(("Error generando backup: " + e.getMessage()).getBytes()));
		}
	}
	
	@GetMapping("/limpiar") // ruta desde JavaScript: /mesalista/api/reportes-backup-db/limipiar
	public ResponseEntity<String> limpiarBaseDeDatos() {
		try {
			String usuario = backupConfig.getUser();
			String clave = backupConfig.getPassword();
			String baseDeDatos = backupConfig.getDatabase();
			String url = "jdbc:mysql://localhost:3306/" + baseDeDatos;

			try (Connection conn = DriverManager.getConnection(url, usuario, clave);
				 Statement stmt = conn.createStatement()) {

				stmt.execute("SET FOREIGN_KEY_CHECKS = 0");
				stmt.execute("TRUNCATE TABLE detalle_pedido");
				stmt.execute("TRUNCATE TABLE pedidos");
				stmt.execute("TRUNCATE TABLE incidentes");
				stmt.execute("SET FOREIGN_KEY_CHECKS = 1");
			}

			return ResponseEntity.ok("Base de datos limpiada correctamente");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError()
					.body("Error al limpiar base de datos: " + e.getMessage());
		}
	}
	
	
	@GetMapping("/exportar-csv")
	public ResponseEntity<Resource> exportarCsvZip() {
	    try {
	        String usuario = backupConfig.getUser();
	        String clave = backupConfig.getPassword();
	        String db = backupConfig.getDatabase();
	        String url = "jdbc:mysql://localhost:3306/" + db;

	        String[] tablas = {"pedidos", "detalle_pedido", "incidentes"};

	        ByteArrayOutputStream zipOutStream = new ByteArrayOutputStream();
	        try (
	            ZipOutputStream zip = new ZipOutputStream(zipOutStream);
	            Connection conn = DriverManager.getConnection(url, usuario, clave)
	        ) {
	            for (String tabla : tablas) {
	                Statement stmt = conn.createStatement();
	                ResultSet rs = stmt.executeQuery("SELECT * FROM " + tabla);
	                ResultSetMetaData meta = rs.getMetaData();
	                int columnCount = meta.getColumnCount();

	                ByteArrayOutputStream csvOut = new ByteArrayOutputStream();
	                PrintWriter writer = new PrintWriter(csvOut);

	                // Encabezados
	                for (int i = 1; i <= columnCount; i++) {
	                    writer.print(meta.getColumnLabel(i));
	                    if (i < columnCount) writer.print(",");
	                }
	                writer.println();

	                // Filas
	                while (rs.next()) {
	                    for (int i = 1; i <= columnCount; i++) {
	                        String value = rs.getString(i);
	                        writer.print(value != null ? value.replaceAll("\"", "\"\"") : "");
	                        if (i < columnCount) writer.print(",");
	                    }
	                    writer.println();
	                }

	                writer.flush();

	                // Añadir archivo CSV al zip
	                zip.putNextEntry(new ZipEntry(tabla + ".csv"));
	                zip.write(csvOut.toByteArray());
	                zip.closeEntry();
	                writer.close();
	                rs.close();
	                stmt.close();
	            }

	            zip.finish();
	        }

	        ByteArrayResource resource = new ByteArrayResource(zipOutStream.toByteArray());

	        String filename = "backup_csv_mesalista_" +
	                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".zip";

	        return ResponseEntity.ok()
	                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
	                .contentType(MediaType.APPLICATION_OCTET_STREAM)
	                .contentLength(resource.contentLength())
	                .body(resource);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.internalServerError()
	                .body(new ByteArrayResource(("Error generando ZIP de CSVs: " + e.getMessage()).getBytes()));
	    }
	}


	
	
	
	
}
