import Script from "next/script";

const Hydro = () => {
  return (
    <>
      <Script
        id="hydro_config"
        type="text/javascript"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.Hydro_tagId = "5aaf26c3-644d-4392-bd0e-d42832c1dcec";
          `,
        }}
      />
      <Script
        id="hydro_script"
        src="https://track.hydro.online/"
        strategy="afterInteractive"
      />
    </>
  );
};

export default Hydro;
