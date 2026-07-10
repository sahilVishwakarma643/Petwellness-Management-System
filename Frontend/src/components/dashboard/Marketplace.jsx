import { Link, useNavigate } from "react-router-dom";
import { addProductToCart } from "../../api/services/cartService";

export default function Marketplace({ products }) {
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    if (!product?.id) {
      navigate("/cart");
      return;
    }

    try {
      await addProductToCart(product.id, 1);
    } finally {
      navigate("/cart");
    }
  };

  return (
    <section className="w-full rounded-2xl border border-app-border bg-app-card shadow-sm">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <h3 className="text-base font-bold text-app-navy">Shop Products</h3>
        <Link
          to="/marketplace"
          className="rounded-full border border-app-teal px-3 py-1 text-xs font-bold text-app-teal transition duration-200 hover:bg-app-teal hover:text-white"
        >
          See all
        </Link>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl border border-app-border bg-app-card">
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-app-teal-light to-[#A7EDD8]">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  product.emoji || "🐾"
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-app-navy">{product.name}</p>
                {product.brand ? <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-app-slate">{product.brand}</p> : null}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-app-teal">{product.price}</p>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-app-teal text-sm font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
