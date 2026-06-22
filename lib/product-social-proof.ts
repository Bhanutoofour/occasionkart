export type ProductSocialProof = {
  rating: string;
  reviewsLabel: string;
};

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function formatReviewCount(count: number) {
  const inThousands = count / 1000;

  if (Number.isInteger(inThousands)) {
    return `${inThousands}K`;
  }

  return `${inThousands.toFixed(1)}K`;
}

export function getProductSocialProof(productKey: string): ProductSocialProof {
  const hash = hashText(productKey);
  const ratingSteps = [4.8, 4.9, 5.0];
  const rating = ratingSteps[hash % ratingSteps.length].toFixed(1);
  const reviewsCount = 1000 + ((hash >>> 3) % 4001);

  return {
    rating,
    reviewsLabel: `${formatReviewCount(reviewsCount)} Reviews`,
  };
}
