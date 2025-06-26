import React, { useState } from 'react';
import { IProduct } from 'models';

// Generate a large mock product list
function generateLargeProductList(count = 10000): IProduct[] {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      title: `Product ${i}`,
      availableSizes: [sizes[i % sizes.length]],
      price: Math.random() * 100,
      currencyFormat: '$',
      currencyId: 'USD',
      installments: 1,
      isFreeShipping: true,
      sku: i,
      style: '',
      description: '',
    }));
  }

// Before: Original (unoptimized) filter logic
function oldFilterProducts(products: IProduct[], filters: string[]): IProduct[] {
  if (filters && filters.length > 0) {
    return products.filter((p: IProduct) =>
      filters.find((filter: string) =>
        p.availableSizes.find((size: string) => size === filter)
      )
    );
  } else {
    return products;
  }
}

// After: Optimized filter logic
function optimizedFilterProducts(products: IProduct[], filters: string[]): IProduct[] {
  if (filters && filters.length > 0) {
    const filterSet = new Set(filters);
    return products.filter((p: IProduct) =>
      p.availableSizes.some((size: string) => filterSet.has(size))
    );
  } else {
    return products;
  }
}

const ProductFetchComparison: React.FC = () => {
  const [beforeTime, setBeforeTime] = useState<number | null>(null);
  const [afterTime, setAfterTime] = useState<number | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
    const products = generateLargeProductList();
    const filters = ['M', 'L', 'XL'];

    // Before
    const startBefore = performance.now();
    const filteredBefore = oldFilterProducts(products, filters);
    const endBefore = performance.now();

    // After
    const startAfter = performance.now();
    const filteredAfter = optimizedFilterProducts(products, filters);
    const endAfter = performance.now();

    setBeforeTime(endBefore - startBefore);
    setAfterTime(endAfter - startAfter);
    setResultCount(filteredAfter.length);
    setLoading(false);
  };

  return (
    <div style={{ margin: 20, padding: 20, border: '2px solid #1976d2', borderRadius: 8, textAlign: 'center' }}>
      <div style={{ margin: '20px 0' }}>
        <button
          onClick={handleRun}
          style={{
            padding: '12px 32px',
            fontSize: '1.1rem',
            borderRadius: 8,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            minWidth: 160,
            position: 'relative',
            marginTop:"50px"
          }}
          disabled={loading}
        >
          {loading ? (
            <span>
              <span className="loader" style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                border: '3px solid #fff',
                borderTop: '3px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: 8,
                verticalAlign: 'middle'
              }} />
              Filtering...
            </span>
          ) : (
            'Comparison Test'
          )}
        </button>
      </div>
      {(resultCount !== null || beforeTime !== null || afterTime !== null) && (
        <div
          style={{
            // marginTop: 5,
            fontSize: '1.3rem',
            fontWeight: 600,
            color: '#1976d2',
            background: '#e3f2fd',
            display: 'inline-block',
            padding: '20px 40px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            minWidth: 320,
          }}
        >
          {resultCount !== null && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: '1.4rem', color: '#0d47a1' }}>Filtered Products Results:</span> <span style={{ color: '#1565c0', fontWeight: 700 }}>{resultCount}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid #bbdefb', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
            <div>
              <span style={{ color: '#1976d2' }}>Before Optimization:</span><br />
              {beforeTime !== null ? (
                <span style={{ color: '#0d47a1', fontWeight: 700 }}>{beforeTime.toFixed(2)} ms</span>
              ) : '--'}
            </div>
            <div>
              <span style={{ color: '#1976d2' }}>After Optimization:</span><br />
              {afterTime !== null ? (
                <span style={{ color: '#0d47a1', fontWeight: 700 }}>{afterTime.toFixed(2)} ms</span>
              ) : '--'}
            </div>
          </div>
        </div>
      )}
      {/* Loader keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
};

export default ProductFetchComparison;