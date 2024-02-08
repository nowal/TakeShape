import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

type PainterCardProps = {
    painterId: string;
};

type PainterData = {
    businessName: string;
    logoUrl?: string;
    phoneNumber?: string;
};

const PainterCard: React.FC<PainterCardProps> = ({ painterId }) => {
    const [painterData, setPainterData] = useState<PainterData | null>(null);
    const firestore = getFirestore();

    useEffect(() => {
        const fetchPainterData = async () => {
            const painterRef = doc(firestore, 'painters', painterId);
            console.log('retrieving info for painter' + painterId);
            const painterSnap = await getDoc(painterRef);

            if (painterSnap.exists()) {
                setPainterData(painterSnap.data() as PainterData);
            } else {
                console.log('No such painter!');
            }
        };

        if (painterId) {
            fetchPainterData();
        }
    }, [painterId, firestore]);

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
            `}</style>
        </div>
    );
};

export default PainterCard;
