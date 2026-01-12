import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Siniestro } from '../interfaces/siniestro.model';

export class SiniestroPdfMapper {

  static generar(s: Siniestro): string {

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('NOTIFICACIÓN DE SINIESTRO', 14, 15);

    doc.setFontSize(10);
    doc.text('Departamento de Manejo de Seguros de Bienes', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Detalle']],
      body: [
        ['Fecha del siniestro', s.fecha_siniestro],
        ['Estado', s.estado],
        [
          'Asegurado',
          s.pedido?.asegurado
            ? `${s.pedido.asegurado.nombre} ${s.pedido.asegurado.apellido}`
            : '-'
        ],
        [
          'Bien asegurado',
          s.pedido?.bien
            ? `${s.pedido.bien.tipo} (${s.pedido.bien.num_serie})`
            : '-'
        ],
        ['Monto del daño', `$${s.monto_danio ?? 0}`],
        ['Deducible', `$${s.deducible ?? 0}`],
        ['Póliza', s.poliza?.num_poliza ?? '-'],
        ['Aseguradora', s.poliza?.aseguradora ?? '-'],
        ['Descripción', s.descripcion_siniestro ?? '-'],
      ],
    });

    doc.text(
      'Este documento ha sido generado automáticamente por el sistema.',
      14,
      doc.internal.pageSize.height - 10
    );

    return doc.output('datauristring'); // 👈 BASE64 para correo
  }
}
