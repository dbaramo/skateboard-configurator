export default function TrucksHtml({
  info,
  index,
  trucksGroupContainerRef,
  snapTruckScroll,
  currentSection,
  positionX,
}) {
  function selectTruck() {
    if (currentSection !== "trucks") return;
    snapTruckScroll(index);
  }
  const { url, name, price } = info;

  return (
    <div
      onClick={selectTruck}
      index={index}
      className="aspect-video w-[200px] cursor-pointer trucks-info-container hidden opacity-0"
    >
      <img src={url} className="object-cover w-full h-full" />
    </div>
  );
}
