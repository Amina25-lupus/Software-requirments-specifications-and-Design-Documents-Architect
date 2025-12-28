
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  PageNumber,
  Header,
  Footer,
  TableOfContents,
  ImageRun,
  ExternalHyperlink
} from "docx";
import FileSaver from "file-saver";
import { ProjectData, DocumentSection } from "../types";

// Base64 Placeholder for IUB Logo (Circular seal style)
const IUB_LOGO_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAACNklEQVR4nO3bS0hUURzH8e+dmXHG0ZIsS8vI6IDMoCx6oEVEuYpAsYhMoSAtpE0I0S6iRUu7FrVpU9Smi6ZFC7WIFm0atclCBykoKAsLpSAt9GidmXtuC88Z986daZp7f/8PloMzzz3n9+Pce88597IsCwAAAAAAAAAAAOD/iaNo9uL49pbeueuWpXm1zN9m9pX9W/X7qO00pTjB/nN/T3+783RreYJ/m0lqT3B39bXf9U5f7VveE6p5UpxgXy7m700/H888vT5U86Q4wV6PZ+f6u2dvD9c+KU6wz+PZxV7X7N3B2ifFCXaxPzvf7Z67P1T7pDjBLvZm57tcc/eHap8UJ9jb8fREt3PhwXDtkeIEez2enuj0LD6srHlSnGCvxtMTXY7Fx5U1T4oT7PV4erLLsfCwsuZJcYJ9HM9OdNrnf1bXPCFOsI/j2YkO6/yj6pohxAn2djw9Xmv9mF7zhDjBPo5nJ2qtH9NrnhAn2Mvx9HiN7fN7zRPiBPs8nh6vtX7NrHlCnGCvxtPjNdbPmTVPiBPs43h2fMX6mF3zhDjBPoznJ1asD9k1T4gT7PV4fsrW9fNrzRPiBPs8np+uWj+m1zwhTrDP48Xpauvf9JInxAn2erw4U2P9nF7zhDjBPoznpxuW1+fUnCD97A/39/Yp+7f60759fX6pXp87X6rX557jXv8Dq7WOfTqH99cAAAAASUVORK5CYII=";

const createTitlePage = (project: ProjectData, docType: string) => {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        // Fix: Use 'as any' cast to resolve TypeScript error in ImageRun options (union type mismatch in docx library)
        new ImageRun({
          data: Uint8Array.from(atob(IUB_LOGO_BASE64), c => c.charCodeAt(0)),
          transformation: { width: 100, height: 100 },
        } as any)
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({ text: "The Islamia University of Bahawalpur", bold: true, size: 32, font: "Calibri" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Department of Artificial Intelligence", bold: true, size: 24, font: "Calibri" })
      ]
    }),
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: docType === 'SRS' ? "SOFTWARE REQUIREMENTS SPECIFICATION" : "SOFTWARE DESIGN DESCRIPTION", bold: true, size: 36, font: "Calibri" }),
        new TextRun({ text: `\n(${docType} DOCUMENT)`, bold: true, size: 24, font: "Calibri", break: 1 })
      ]
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "for", size: 24, font: "Calibri" })]
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `<${project.title.toUpperCase()}>`, bold: true, size: 32, font: "Calibri" })]
    }),
    new Paragraph({ spacing: { before: 800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Submitted By", bold: true, size: 22, font: "Calibri" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: project.studentName, size: 24, font: "Calibri", break: 1 }),
        new TextRun({ text: `Roll No: ${project.rollNo}`, size: 24, font: "Calibri", break: 1 }),
        new TextRun({ text: `Session: ${project.session}`, size: 24, font: "Calibri", break: 1 })
      ]
    }),
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Supervisor", bold: true, size: 22, font: "Calibri" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: project.supervisorName, size: 24, font: "Calibri", break: 1 }),
        new TextRun({ text: project.supervisorDesignation, size: 24, font: "Calibri", break: 1 })
      ]
    }),
    new Paragraph({ spacing: { before: 800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Bachelor of Science in Artificial Intelligence", bold: true, size: 24, font: "Calibri" })
      ]
    }),
    new Paragraph({
        children: [new TextRun({ text: "", break: 1 })],
        pageBreakBefore: true
    })
  ];
};

const createHistoryTable = (project: ProjectData) => {
    return [
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "Revision History", size: 28, font: "Calibri", bold: true })]
        }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Reason", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Version", bold: true })] })] }),
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: project.studentName })] }),
                        new TableCell({ children: [new Paragraph({ text: new Date().toLocaleDateString() })] }),
                        new TableCell({ children: [new Paragraph({ text: "Initial Draft" })] }),
                        new TableCell({ children: [new Paragraph({ text: "1.0" })] }),
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.RIGHT, children: [
            new TextRun({ text: `Supervised by: ${project.supervisorName}`, break: 2, font: "Calibri" }),
            new TextRun({ text: "\nSignature: ____________________", break: 1, font: "Calibri" })
        ]}),
        new Paragraph({
            children: [new TextRun({ text: "", break: 1 })],
            pageBreakBefore: true
        })
    ];
};

export const generateDocFile = async (project: ProjectData, sections: DocumentSection[], docType: string) => {
  const children: any[] = [];

  // 1. Title Page
  children.push(...createTitlePage(project, docType));

  // 2. Table of Contents
  children.push(
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Table of Contents", size: 32, bold: true, font: "Calibri" })]
    }),
    new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
    }),
    new Paragraph({ pageBreakBefore: true })
  );

  // 3. History Tables
  children.push(...createHistoryTable(project));

  // 4. Content Sections
  sections.forEach((section, index) => {
    const sectionTitle = `${index + 1} ${section.title}`;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
            new TextRun({ 
                text: sectionTitle, 
                size: 32, 
                bold: true, 
                font: "Calibri" 
            })
        ]
      })
    );

    const isDiagram = section.title.toLowerCase().includes('graph') || section.title.toLowerCase().includes('architecture');

    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 276 },
        children: [
            new TextRun({ 
                text: section.content, 
                size: 22,
                font: isDiagram ? "Consolas" : "Calibri",
                color: isDiagram ? "0000FF" : "000000"
            })
        ]
      })
    );

    if (section.subsections) {
      section.subsections.forEach((sub, subIdx) => {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
                new TextRun({ 
                    text: `${index + 1}.${subIdx + 1} ${sub.title}`, 
                    size: 28, 
                    bold: true, 
                    font: "Calibri" 
                })
            ]
          })
        );
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 276 },
            children: [
                new TextRun({ 
                    text: sub.content, 
                    size: 22, 
                    font: "Calibri" 
                })
            ]
          })
        );
      });
    }
  });

  const doc = new Document({
    features: {
      updateFields: true,
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: project.title, size: 18, color: "888888" })]
                    })
                ]
            })
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "IUB AI Department - " }),
                            new TextRun({ children: [PageNumber.CURRENT] })
                        ]
                    })
                ]
            })
        },
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  FileSaver.saveAs(buffer, `${project.title.replace(/\s+/g, '_')}_${docType}.docx`);
};
