export default function BirthdayFlower(): JSX.Element {
  return (
    <svg className="birthdayFlower" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {Array.from({ length: 6 }, (_, index) => (
        <ellipse key={index} cx="16" cy="9" rx="4.5" ry="6.5"
          transform={`rotate(${index * 60} 16 16)`}
          fill="#eee3f6" stroke="currentColor" strokeWidth="1.2" />
      ))}
      <circle cx="16" cy="16" r="3.2" fill="currentColor" />
    </svg>
  );
}
