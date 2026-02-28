import { NewsletterForm } from './NewsletterForm';

export const NewsletterSection = () => {
  return (
    <section className="container w-full bg-neutral-100 flex items-center justify-center">
      <div className=" max-w-xl flex flex-col gap-8 py-16 w-full">
        <p className="text-2xl md:text-3xl font-light text-center">
          Приєднуйтесь до нас і отримайте доступ до закритих розпродажів
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
};
