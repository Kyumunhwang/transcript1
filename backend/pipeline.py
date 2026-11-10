"""
CLI Batch Pipeline to parse all transcripts in docs/ and load into the database.
"""
import sys
import glob
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn

# Ensure proper encoding on Windows console
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.config import init_db, DB_STATUS
from backend.parser import parse_transcript_file
from backend.db_loader import save_transcript_to_db, get_all_students

console = Console(force_terminal=True, legacy_windows=False)

def run_batch_ingestion(docs_dir: str = "d:\\Transcripts\\docs"):
    """
    Scans docs_dir, parses each PDF transcript, and persists into the database.
    """
    console.print("[bold blue]====================================================[/bold blue]")
    console.print("[bold blue]  Lighthouse International School - SIS Ingestion   [/bold blue]")
    console.print("[bold blue]====================================================[/bold blue]")
    
    # 1. Initialize DB tables
    console.print("[cyan]Initializing Database...[/cyan]")
    init_db()
    console.print(f"[green][OK] DB Status: {DB_STATUS}[/green]\n")

    # 2. Collect PDF files
    pdf_files = sorted(glob.glob(str(Path(docs_dir) / "*.pdf")))
    total_files = len(pdf_files)
    if total_files == 0:
        console.print(f"[bold red]No PDF files found in {docs_dir}[/bold red]")
        return

    console.print(f"[bold]Found {total_files} PDF files in {docs_dir}[/bold]\n")

    success_count = 0
    failed_files = []

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        task = progress.add_task("[yellow]Processing transcripts...", total=total_files)

        for pdf_path in pdf_files:
            file_name = Path(pdf_path).name
            progress.update(task, description=f"[yellow]Parsing {file_name[:28]}...")

            try:
                # Parse
                parsed_data = parse_transcript_file(pdf_path)
                # Persist to Database
                student_id = save_transcript_to_db(parsed_data, source_filename=file_name)
                success_count += 1
                progress.console.print(f"[green][SUCCESS] Ingested: {file_name} -> {student_id}[/green]")
            except Exception as e:
                failed_files.append((file_name, str(e)))
                progress.console.print(f"[red][ERROR] Failed to process {file_name}: {e}[/red]")

            progress.advance(task)

    # 3. Final Summary Table
    console.print("\n[bold green]================ Ingestion Complete ================[/bold green]")
    console.print(f"Total: {total_files} | [green]Success: {success_count}[/green] | [red]Failed: {len(failed_files)}[/red]\n")

    # Display Students Table
    students = get_all_students()
    table = Table(title="Ingested Students Summary")
    table.add_column("Student ID", style="cyan")
    table.add_column("Name", style="magenta")
    table.add_column("Birth Date", style="white")
    table.add_column("Gender", style="white")
    table.add_column("Cumulative GPA", justify="right", style="green")
    table.add_column("Cumulative Credits", justify="right", style="yellow")
    table.add_column("Source PDF", style="dim")

    for s in students:
        table.add_row(
            s["id"],
            s["name"],
            s["birth_date"] or "-",
            s["gender"] or "-",
            f"{s['gpa']:.3f}" if s["gpa"] is not None else "-",
            f"{s['credits']:.2f}" if s["credits"] is not None else "-",
            s["source_file"] or "-"
        )

    console.print(table)


if __name__ == "__main__":
    run_batch_ingestion()
