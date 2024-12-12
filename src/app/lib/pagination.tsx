import { useState, useCallback, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    DocumentSnapshot,
    Query,
    QueryConstraint
} from 'firebase/firestore';
import { db } from '@/app/firebase-config';

interface PaginationHook<T> {
    items: T[];
    loading: boolean;
    error: Error | null;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    fetchNextPage: () => Promise<void>;
    fetchPrevPage: () => Promise<void>;
}

export function useFirebasePagination<T extends { id: string }>(
    collectionPath: string,
    itemsPerPage: number = 15,
    orderByField: string = 'created_at'
): PaginationHook<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [currentPage, setCurrentPage] = useState(1); // Start with page 1
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Keep track of first and last documents for pagination
    const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | null>(null);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

    // Track if the data has been fetched at least once
    const [hasFetched, setHasFetched] = useState(false);

    // Fetch total count of documents
    const fetchTotalCount = useCallback(async () => {
        try {
            const totalQuery = await getDocs(collection(db, collectionPath));
            const totalDocs = totalQuery.size;
            setTotalPages(Math.ceil(totalDocs / itemsPerPage));
        } catch (err) {
            console.error('Error fetching total count:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
    }, [collectionPath, itemsPerPage]);

    // Create base query with common constraints
    const createBaseQuery = useCallback((): Query => {
        const constraints: QueryConstraint[] = [
            orderBy(orderByField),
            limit(itemsPerPage)
        ];
        return query(collection(db, collectionPath), ...constraints);
    }, [collectionPath, orderByField, itemsPerPage]);

    // Fetch items with pagination
    const fetchItems = useCallback(async (paginationType: 'next' | 'prev' = 'next') => {
        setLoading(true);
        setError(null);

        try {
            let baseQuery = createBaseQuery();

            // Apply start after/before based on pagination direction
            if (paginationType === 'next' && lastDoc) {
                baseQuery = query(baseQuery, startAfter(lastDoc));
            } else if (paginationType === 'prev' && firstDoc) {
                // Note: Firestore doesn't have a direct "startBefore" method
                // You might need a more complex approach for previous page
                console.warn('Previous page pagination is complex in Firestore');
            }

            const querySnapshot = await getDocs(baseQuery);

            // Check if there are more items
            setHasMore(querySnapshot.docs.length === itemsPerPage);

            // Transform documents to typed items
            const fetchedItems = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }) as T);

            // Update documents and pagination state
            setItems(fetchedItems);

            // Update first and last documents for next/prev pagination
            if (querySnapshot.docs.length > 0) {
                setFirstDoc(querySnapshot.docs[0]);
                setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            }

            // Update current page only when moving between pages (not on first fetch)
            if (hasFetched) {
                if (paginationType === 'next') {
                    setCurrentPage(prev => prev + 1);
                } else if (paginationType === 'prev') {
                    setCurrentPage(prev => prev - 1);
                }
            } else {
                // After the first fetch, set hasFetched to true
                setHasFetched(true);
            }
        } catch (err: unknown) {
            console.error('Error fetching items:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [createBaseQuery, lastDoc, firstDoc, itemsPerPage, hasFetched]);

    // Fetch initial items and total count
    useEffect(() => {
        fetchItems('next'); // First fetch to initialize items (i.e., page 1)
        fetchTotalCount(); // Fetch total count to calculate total pages
    }, []); // Empty dependency array ensures this runs only on mount

    // Methods to fetch next and previous pages
    const fetchNextPage = useCallback(async () => {
        if (hasMore) {
            await fetchItems('next');
        }
    }, [fetchItems, hasMore]);

    const fetchPrevPage = useCallback(async () => {
        if (currentPage > 1) {
            await fetchItems('prev');
        }
    }, [fetchItems, currentPage]);

    return {
        items,
        loading,
        error,
        currentPage,
        totalPages,
        hasMore,
        fetchNextPage,
        fetchPrevPage
    };
}
