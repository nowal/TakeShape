  // const calculateAverageRating = (
  //   reviews: number[] | undefined
  // ) => {
  //   if (!reviews || reviews.length === 0) {
  //     return null;
  //   }
  //   const total = reviews.reduce(
  //     (acc, rating) => acc + rating,
  //     0
  //   );
  //   const average = total / reviews.length;
  //   const fullStars = Math.floor(average);
  //   const halfStar = average - fullStars >= 0.5;
  //   const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  //   return (
  //     <div className="painter-reviews">
  //       {Array(fullStars)
  //         .fill(0)
  //         .map((_, i) => (
  //           <Star key={`full-${i}`} className="star full" />
  //         ))}
  //       {halfStar && <StarHalf className="star half" />}
  //       {Array(emptyStars)
  //         .fill(0)
  //         .map((_, i) => (
  //           <StarBorder
  //             key={`empty-${i}`}
  //             className="star empty"
  //           />
  //         ))}
  //     </div>
  //   );
  // };

 //       {/* {calculateAverageRating(painterData.reviews)} */}
