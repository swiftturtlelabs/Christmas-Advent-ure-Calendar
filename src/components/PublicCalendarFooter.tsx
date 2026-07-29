interface PublicCalendarFooterProps {
  year: number;
}

export function PublicCalendarFooter({ year }: PublicCalendarFooterProps) {
  return (
    <footer className="public-footer">
      <p>
        <a href="https://christmasadventurecalendar.com/">Christmas Advent-ure Calendar</a> {year} by{' '}
        <a href="https://swiftturtlelabs.com/">Swift Turtle Labs</a>
      </p>
    </footer>
  );
}
