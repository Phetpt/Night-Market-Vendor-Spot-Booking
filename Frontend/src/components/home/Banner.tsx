import Image from "next/image";

export default function Banner() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden bg-[#081028]">

      {/* Picture */}
      <Image
        src="/img/Night_Market.png"
        alt="banner"
        fill
        priority
        className="object-cover "
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#081028]/95 via-[#081028]/60 to-transparent"/>

      {/* Content */}
      <div className="relative z-10 flex min-h-[70vh] flex-col justify-center px-6 py-12 md:px-16">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
          Your business starts here
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Find Your Perfect <br />
          Spot at the{" "}
        
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Night Market
          </span>
        </h1>

      </div>
    </section>
  );
}