export default function WheelsHtml({
  info,
  index,

  snapWheelsScroll,
  currentSection,
}) {
  function selectWheel() {
    if (currentSection !== "wheels") return;

    snapWheelsScroll(index);
  }
  const { url, name, price } = info;
  return (
    <div
      onClick={selectWheel}
      index={index}
      className="aspect-square w-[130px] sm:w-[150px] cursor-pointer wheels-info-container hidden opacity-0"
    >
      <img src={url} className="object-cover w-full h-full" />
    </div>
  );
}
