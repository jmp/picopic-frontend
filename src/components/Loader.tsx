type LoaderProps = {
  hidden: boolean
};

export function Loader({hidden}: LoaderProps) {
  return (
    <div hidden={hidden} className="loading">
      <div title="Loading..." className="spinner">
        <div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/>
      </div>
    </div>
  );
}