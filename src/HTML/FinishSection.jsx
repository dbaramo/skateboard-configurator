function Item({ info }) {
  const { name, price, url } = info;
  return (
    <div className="flex items-center justify-between border-b">
      <div className="flex items-center gap-5">
        <div className="w-[50px] h-[50px]">
          <img src={url} className="object-contain  w-full h-full" />
        </div>
        <p className="text-xs">{name}</p>
      </div>

      <p className="text-xs font-bold">{price}</p>
    </div>
  );
}

export default function FinishSection({ selections }) {
  const total = selections.reduce((p, c) => {
    return (p += parseFloat(c.price.replace("$", "")));
  }, 0);

  return (
    <div className="w-screen flex justify-center">
      <div className="min-w-[80%] sm:min-w-[450px] border-t flex flex-col gap-2">
        <div>
          {selections.map((s, i) => {
            return <Item info={s} key={i} />;
          })}
        </div>
        <div className="text-center">
          <p className="font-bold pb-2">${total.toFixed(2)}</p>

          <button className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white">
            add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
