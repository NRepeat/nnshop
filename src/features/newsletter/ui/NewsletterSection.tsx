import { NewsletterForm } from './NewsletterForm';

export const NewsletterSection = () => {
  return (
    <section className="w-full bg-neutral-100 py-16">
      <div className="container max-w-xl mx-auto flex flex-col gap-8">
        <p className="text-2xl md:text-3xl font-light text-center">
          Приєднуйтесь до нас і отримайте доступ до закритих розпродажів
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
};
