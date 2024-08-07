import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Star, StarHalf, StarBorder } from '@mui/icons-material';

type PainterCardProps = {
    painterId: string;
};

type PainterData = {
    businessName: string;
    logoUrl?: string;
    phoneNumber?: string;
    reviews?: number[];
};

const PainterCard: React.FC<PainterCardProps> = ({ painterId }) => {
    const [painterData, setPainterData] = useState<PainterData | null>(null);
    const firestore = getFirestore();

    useEffect(() => {
        const fetchPainterData = async () => {
            const painterQuery = query(collection(firestore, 'painters'), where('userId', '==', painterId));
            console.log('retrieving info for painter ' + painterId);
            const painterSnapshot = await getDocs(painterQuery);

            if (!painterSnapshot.empty) {
                const painterDoc = painterSnapshot.docs[0].data();
                setPainterData(painterDoc as PainterData);
            } else {
                console.log('No such painter!');
            }
        };

        if (painterId) {
            fetchPainterData();
        }
    }, [painterId, firestore]);

    const calculateAverageRating = (reviews: number[] | undefined) => {
        if (!reviews || reviews.length === 0) {
            return null;
        }
        const total = reviews.reduce((acc, rating) => acc + rating, 0);
        const average = total / reviews.length;
        const fullStars = Math.floor(average);
        const halfStar = average - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className="painter-reviews">
                {Array(fullStars).fill(0).map((_, i) => (
                    <Star key={`full-${i}`} className="star full" />
                ))}
                {halfStar && <StarHalf className="star half" />}
                {Array(emptyStars).fill(0).map((_, i) => (
                    <StarBorder key={`empty-${i}`} className="star empty" />
                ))}
            </div>
        );
    };

    if (!painterData) {
        return <div>Loading painter data...</div>;
    }

    return (
        <div className="painter-card secondary-color">
            {painterData.logoUrl && (
                <img
                    src={painterData.logoUrl}
                    alt={`${painterData.businessName} Logo`}
                    className="painter-logo"
                />
            )}
            <div className='flex-col flex justify-between'>
                <h2 className="painter-name">{painterData.businessName}</h2>
                <h2 className="painter-phone">{painterData.phoneNumber}</h2>
                {calculateAverageRating(painterData.reviews)}
            </div>
            <style jsx>{`
                .painter-card {
                    padding: 20px;
                    margin: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                    transition: 0.3s;
                    display: flex;
                    align-items: center;
                    flex: 1;
                }
                .painter-card:hover {
                    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
                }
                .painter-logo {
                    width: 50px;
                    height: 50px;
                    border-radius: 5px;
                    margin-right: 10px;
                    object-fit: cover;
                }
                .painter-name {
                    font-size: 1.5em;
                    color: #333;
                    margin-right: 10px;
                }
                .is-insured {
                    font-size: 1em;
                    color: green;
                    display: flex;
                    align-items: center;
                }
                .checkmark {
                    font-size: 1.5em;
                }
                .painter-phone {
                    font-size: 1em; /* Smaller font size for phone number */
                    color: #555; /* Slightly lighter color for contrast */
                    margin-top: 5px; /* Space between name and phone number */
                }
                .painter-reviews {
                    font-size: 1em;
                    margin-top: 5px;
                    display: flex; /* Ensure stars are aligned horizontally */
                    align-items: center;
                }
                .star {
                    font-size: 1.5em;
                    color: #FFD700; /* Gold color for stars */
                    margin-right: 2px; /* Add some space between stars */
                }
                .star.empty {
                    color: #ccc; /* Gray color for empty stars */
                }
                .no-reviews {
                    color: #999; 
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default PainterCard;
