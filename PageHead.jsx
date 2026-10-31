export default function PageHead({ title, intro }) {
  return (
    <>
      <h2 className="t">{title}</h2>
      <div className="orn" />
      {intro ? <p className="intro rv">{intro}</p> : null}
    </>
  );
}
