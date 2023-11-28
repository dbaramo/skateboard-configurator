export default function Top() {
  return (
    <div className="w-screen flex justify-center sm:justify-between text-xs p-2 sm:p-8">
      <div className="hidden sm:block">{/* <h1>Home</h1> */}</div>
      <div
        id="section-label-container"
        className="flex gap-5 text-gray-300 font-extrabold"
      >
        <p className="uppercase text-black">1. Board</p>
        <p className="uppercase">2. Trucks</p>
        <p className="uppercase">3. Wheels</p>
        <p className="uppercase">4. Finish</p>
      </div>
      <div className="hidden sm:block">
        <img src="cart.svg" />
      </div>
    </div>
  );
}
