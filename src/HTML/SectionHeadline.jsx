export default function SectionHeadline({ headlineText }) {
  return (
    <div className="w-screen ">
      <h1 className="text-3xl font-extralight text-center section-header">
        {headlineText}
      </h1>
    </div>
  );
}
