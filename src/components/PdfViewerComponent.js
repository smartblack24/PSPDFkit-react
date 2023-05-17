import { useEffect, useMemo, useRef, useState } from "react";

var filename = "https://info.vistaequitypartners.com/rs/839-JEW-563/images/Vista%20Equity%20Partners%20Investor%20Update%20%28Restricted%20Access%29.pdf"

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  const [permissions, setPermissions] = useState({
    print: true,
    download: true,
    rightClick: false,
  });

  const unavaibleToolbarItems = useMemo(() => {
    const toolbarItems = ["ink", "ink-signature", "stamp", "arrow", "image", "note", "text", "ellipse", "polygon", "ink-eraser", "highlighter", "text-highlighter", "polyline", "rectangle", "line", "annotate", "search", "cloud", "link"]
    if (!permissions.print) {
      toolbarItems.push("print");
    }
    if (!permissions.download) {
      toolbarItems.push("export-pdf");
    }
    return toolbarItems;
  }, [permissions]);

  const customDownloadButton = {
    type: "custom",
    id: "download-pdf",
    icon: "/download.svg",
    title: "Download",
    onPress: (instance) => {
      console.log('instance', instance)
      instance.exportPDF().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/pdf" });
        const fileName1 = "{{my.Letter Title}}.pdf";
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName1);
        } else {
          const objectUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = objectUrl;
          a.style = "display: none";
          a.download = fileName1;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(objectUrl);
          document.body.removeChild(a);
        }
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit;

    (async function () {
      PSPDFKit = await import("pspdfkit");
      // const customToolbarItems = PSPDFKit.defaultToolbarItems.filter((item) => {
      //   return !["ink", "ink-signature", "stamp", "arrow", "image", "note", "text", "ellipse", "polygon", "ink-eraser", "highlighter", "text-highlighter", "polyline", "rectangle", "line", "print", "annotate", "search"].includes(item.type)
      // });

      const customToolbarItems = PSPDFKit.defaultToolbarItems.filter((item) => {
        return !unavaibleToolbarItems.includes(item.type)
      });

      const pdfInstance = await PSPDFKit.load({
        // Container where PSPDFKit should be mounted.
        container,
        // The document to open.
        document: props.document,
        // document: filename,
        // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
        baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
        // licenseKey: "Rze0u7avAFNDdbCw4TcRNg8pestQUkSmFhIymTAVQgyrR5uLXvQVmPG3beFQOFfmQV7GEZ5f4lqVWd8eUPAp8oyr-ozd335gAg90sEHo_cYs1TXShYtzYJ1Bkj7I1G__RpsOvX7IUoUuJerxMosVAyi5s0CyRMqKKpMBk0jwQint6iGvxeervqLO5KHpihL-jWP12FlEfCtyObGJGYjDIH51gLX1vEiflFsG-hHr1ZlPXLPXj3loZbGSPGEZKaU1_fVm37IrUKwEMIer1CsG2F8Ki8IQwr9Dd8x5TJ14JpZdxKoQqtvWNr0yr1xuZ7vT928j9_XtNO_eRwbQdAppbJxA20lbqfS6NgwDZlOL1ajfhYGpuQLL2HISewNOM2uKB5emZ4M40wNLJz0ZLYxTBv5Kj6syYX_A-ndu2VL6MzlsL9SdFoB6SlxxpDv7eleYJJuiB2x-70bS68w_wCQd9EIzQ2O0nhrZSmCPpEDyf2hor6bUxPuWBwdCUEdDP_d9VZeJQMsh0VxCLbW-YgUX1vIIofA9M2XYj27VfwfpbJFk3hqzhfTzqpt8lhm37KOzI5W1k2OU-MFhsHXFZtwR8Z9Ef6n3REvL2wmMMmxe8iQ=",

        // Custom configuration from snippet
        toolbarItems: customToolbarItems,

        initialViewState: new PSPDFKit.ViewState({
          zoom: PSPDFKit.ZoomMode.FIT_TO_WIDTH,
          readOnly: true
        }),

        isEditableAnnotation: function isEditableAnnotation(annotation) {
          if (annotation.customData) {
            return !annotation.customData.watermark;
          }
      
          return true;
        }
      });

      pdfInstance.contentDocument.addEventListener('contextmenu', event => event.preventDefault())

      // Create Watermark
      for (var pageIndex = 0; pageIndex < pdfInstance.totalPageCount; ++pageIndex) {
        var pageInfo = pdfInstance.pageInfoForIndex(pageIndex);
        var fontSize = 30;
        var watermark = new PSPDFKit.Annotations.TextAnnotation({
          pageIndex: pageIndex,
          text: { format: "plain", value: "Vista Equity Partners Management, LLC\n".concat(new Date().toLocaleString()) },
          font: "Helvetica",
          fontSize: fontSize,
          horizontalAlign: "center",
          boundingBox: new PSPDFKit.Geometry.Rect({
            left: 0,
            top: pageInfo.height / 2 - fontSize / 2,
            width: pageInfo.width,
            height: fontSize * 3 + 100
          }),
          fontColor: PSPDFKit.Color.BLACK,
          opacity: 0.15,
          customData: {
            watermark: true
          }
        });
        pdfInstance.create(watermark);
      }

      /**
       * Add Event Listener
       * Time Viewed per Session
       * Scroll Depth per Session
       * Times Printed
       * Time Downloaded
       * Words Highlighted
       * Words Copied from Document
       * Document Rendering Status per Session
       */
      pdfInstance.addEventListener("viewState.change", (viewState) => {
        console.log(viewState.toJS());
      });
    })();

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
