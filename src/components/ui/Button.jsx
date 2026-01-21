const variants = {
  primary:
    "disabled:bg-gray-200 text-sm bg-gray-800 text-white hover:bg-gray-700 duration-200 transition font-bold p-2 rounded-md mt-12 w-full",
};

export default function Button({ variant, className, children, ...props }) {
  variant ??= "primary";

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
