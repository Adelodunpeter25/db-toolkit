"""PDF export for analytics metrics."""

from typing import Dict, List, Any
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io


def generate_analytics_pdf(
    connection_name: str,
    metrics: Dict[str, Any],
    historical_data: List[Dict[str, Any]],
    slow_queries: List[Dict[str, Any]],
    table_stats: List[Dict[str, Any]]
) -> bytes:
    """Generate PDF report for analytics data."""
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    story.append(Paragraph(f"Database Analytics Report", title_style))
    story.append(Paragraph(f"Connection: {connection_name}", styles['Heading2']))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Current Metrics
    story.append(Paragraph("Current Metrics", styles['Heading2']))
    metrics_data = [
        ['Metric', 'Value'],
        ['Active Connections', str(metrics.get('active_connections', 0))],
        ['Idle Connections', str(metrics.get('idle_connections', 0))],
        ['Database Size', f"{metrics.get('database_size', 0) / (1024**3):.2f} GB"],
        ['CPU Usage', f"{metrics.get('system_stats', {}).get('cpu_usage', 0):.1f}%"],
        ['Memory Usage', f"{metrics.get('system_stats', {}).get('memory_usage', 0):.1f}%"],
        ['Disk Usage', f"{metrics.get('system_stats', {}).get('disk_usage', 0):.1f}%"],
    ]
    
    metrics_table = Table(metrics_data, colWidths=[3*inch, 3*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Query Statistics
    if metrics.get('query_stats'):
        story.append(Paragraph("Query Distribution", styles['Heading2']))
        query_data = [['Query Type', 'Count']]
        for qtype, count in metrics['query_stats'].items():
            query_data.append([qtype, str(count)])
        
        query_table = Table(query_data, colWidths=[3*inch, 3*inch])
        query_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(query_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Slow Queries
    if slow_queries:
        story.append(PageBreak())
        story.append(Paragraph("Slow Query Log (Last 24 Hours)", styles['Heading2']))
        slow_data = [['Timestamp', 'Duration (s)', 'User', 'Query']]
        for q in slow_queries[:20]:
            slow_data.append([
                q['timestamp'][:19],
                f"{q['duration']:.2f}",
                q['user'][:20],
                q['query'][:60] + '...' if len(q['query']) > 60 else q['query']
            ])
        
        slow_table = Table(slow_data, colWidths=[1.5*inch, 1*inch, 1*inch, 3*inch])
        slow_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EF4444')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(slow_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Table Statistics
    if table_stats:
        story.append(PageBreak())
        story.append(Paragraph("Table Statistics (Top 20)", styles['Heading2']))
        table_data = [['Table', 'Size', 'Rows']]
        for t in table_stats[:20]:
            table_name = t.get('tablename') or t.get('table_name') or t.get('collection', 'N/A')
            size = t.get('size', 'N/A')
            if isinstance(size, (int, float)):
                size = f"{size / (1024**2):.2f} MB"
            rows = t.get('row_count', t.get('n_live_tup', 0))
            table_data.append([table_name[:40], str(size), str(rows)])
        
        table_table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        table_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10B981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table_table)
    
    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
