package pe.com.mesalista.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

public class ExcelExporter {

	public static byte[] exportToExcel(List<Object[]> data, String[] headers) throws IOException {
		try (Workbook workbook = new XSSFWorkbook()) {
			Sheet sheet = workbook.createSheet("Reporte");

			// Crear estilo para encabezados
			CellStyle headerStyle = workbook.createCellStyle();
			Font headerFont = workbook.createFont();
			headerFont.setBold(true);
			headerStyle.setFont(headerFont);

			// Crear fila de encabezados
			Row headerRow = sheet.createRow(0);
			for (int i = 0; i < headers.length; i++) {
				Cell cell = headerRow.createCell(i);
				cell.setCellValue(headers[i]);
				cell.setCellStyle(headerStyle);
			}

			// Llenar filas con datos
			int rowIdx = 1;
			for (Object[] record : data) {
				Row row = sheet.createRow(rowIdx++);
				for (int colIdx = 0; colIdx < record.length; colIdx++) {
					Cell cell = row.createCell(colIdx);
					Object value = record[colIdx];
					if (value == null) {
						cell.setCellValue("");
					} else if (value instanceof Number) {
						cell.setCellValue(((Number) value).doubleValue());
					} else {
						cell.setCellValue(value.toString());
					}
				}
			}

			// Autoajustar columnas después de insertar los datos
			for (int i = 0; i < headers.length; i++) {
				sheet.autoSizeColumn(i);
			}

			// Escribir archivo Excel en un array de bytes
			try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
				workbook.write(out);
				return out.toByteArray();
			}
		}
	}
}
