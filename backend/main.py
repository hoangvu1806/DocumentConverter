from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pypandoc
import os
import tempfile
import shutil
from pathlib import Path
from typing import Optional

app = FastAPI(title="Document Converter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:6565"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path("temp_files")
TEMP_DIR.mkdir(exist_ok=True)

FORMAT_MAPPING = {
    "latex": "latex",
    "markdown": "markdown",
    "html": "html",
    "rst": "rst",
    "org": "org",
    "docbook": "docbook",
    "epub": "epub",
    "docx": "docx",
    "pdf": "pdf",
    "plain": "plain",
}

MEDIA_TYPES = {
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "pdf": "application/pdf",
    "html": "text/html",
    "latex": "application/x-latex",
    "markdown": "text/markdown",
    "epub": "application/epub+zip",
    "plain": "text/plain",
    "rst": "text/x-rst",
    "org": "text/org",
}

EXTENSIONS = {
    "docx": ".docx",
    "pdf": ".pdf",
    "html": ".html",
    "latex": ".tex",
    "markdown": ".md",
    "epub": ".epub",
    "plain": ".txt",
    "rst": ".rst",
    "org": ".org",
}


@app.get("/")
async def root():
    return {
        "message": "Document Converter API",
        "version": "2.0.0",
        "endpoints": {
            "convert": "/api/convert"
        },
        "supported_formats": {
            "input": list(FORMAT_MAPPING.keys())[:7],
            "output": list(FORMAT_MAPPING.keys())[7:] + list(FORMAT_MAPPING.keys())[:7]
        }
    }


@app.post("/api/convert")
async def convert_document(
    file: UploadFile = File(...),
    from_format: str = Form(...),
    to_format: str = Form(...)
):
    if from_format not in FORMAT_MAPPING:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported input format: {from_format}"
        )
    
    if to_format not in FORMAT_MAPPING:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format: {to_format}"
        )

    input_path = None
    output_path = None
    
    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=EXTENSIONS.get(from_format, ".txt"),
            dir=TEMP_DIR
        ) as temp_input:
            content = await file.read()
            temp_input.write(content)
            input_path = temp_input.name
        
        output_ext = EXTENSIONS.get(to_format, ".txt")
        output_filename = file.filename.rsplit('.', 1)[0] + output_ext if file.filename else f"document{output_ext}"
        output_path = TEMP_DIR / f"output_{os.path.basename(input_path).rsplit('.', 1)[0]}{output_ext}"

        extra_args = ['--standalone']
        
        if to_format == "pdf":
            extra_args.extend(['--pdf-engine=xelatex'])
        
        pypandoc.convert_file(
            input_path,
            FORMAT_MAPPING[to_format],
            outputfile=str(output_path),
            format=FORMAT_MAPPING[from_format],
            extra_args=extra_args
        )
        
        if not output_path.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create {to_format.upper()} file"
            )
        
        media_type = MEDIA_TYPES.get(to_format, "application/octet-stream")
        
        return FileResponse(
            path=str(output_path),
            filename=output_filename,
            media_type=media_type,
            background=None
        )
    
    except pypandoc.PandocError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pandoc conversion error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Conversion error: {str(e)}"
        )
    finally:
        if input_path and os.path.exists(input_path):
            try:
                os.unlink(input_path)
            except:
                pass


@app.on_event("shutdown")
async def cleanup():
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6464)
