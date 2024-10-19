import {
  QueryDocumentSnapshot,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

export type TFirestoreSnapshot = QuerySnapshot<
  DocumentData,
  DocumentData
>;

export type TFirestoreDocumentSnapshot = QueryDocumentSnapshot<
  DocumentData,
  DocumentData
>;
