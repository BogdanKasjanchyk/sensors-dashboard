export default function HomePage() {
  return (
    <section className="mx-auto max-w-4xl py-6 sm:py-10">
      <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Моніторинг давачів — Next.js + NestJS
      </h1>
      <p className="mb-6 max-w-2xl leading-relaxed text-muted">
        Цей проєкт демонструє роботу системи моніторингу давачів температури
        (Sensor 1) та вологості (Sensor 2). Інтерфейс побудований на{" "}
        <strong className="text-foreground">Next.js</strong> з використанням{" "}
        <strong className="text-foreground">Tailwind CSS</strong> і розгорнутий
        на <strong className="text-foreground">Vercel</strong>.
      </p>
      <p className="max-w-2xl leading-relaxed text-muted">
        Дані графіків надходять із серверного застосунку на{" "}
        <strong className="text-foreground">NestJS</strong>, розгорнутого на{" "}
        <strong className="text-foreground">Render</strong>, і оновлюються
        кожні 10 секунд.
      </p>
    </section>
  );
}
