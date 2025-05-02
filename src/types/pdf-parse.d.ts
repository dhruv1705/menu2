declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: {
      Author?: string;
      CreationDate?: string;
      Creator?: string;
      Keywords?: string;
      ModDate?: string;
      PDFFormatVersion?: string;
      Producer?: string;
      Subject?: string;
      Title?: string;
    };
    metadata?: any;
    version?: string;
  }

  function parse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  
  export = parse;
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdfParse from 'pdf-parse';
  export default pdfParse;
} 