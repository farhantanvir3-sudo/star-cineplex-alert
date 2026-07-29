export const checkTicketAvailability = async (targetDate: string): Promise<{ isAvailable: boolean }> => {
  try {
    const response = await fetch('https://cineplex-ticket-api.cineplexbd.com/api/v1/get-showdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location: 3 }),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch from Cineplex API:', response.statusText);
      return { isAvailable: false };
    }

    const data = await response.json();

    // The data structure might vary, but typically we want to see if the targetDate exists and has non-empty showtimes
    // Depending on how Star Cineplex API structures it (e.g., an array of dates or an object mapping dates to shows)
    // Let's perform a generic check to see if the targetDate string is present in the response
    // Or if the response data array is simply not empty when we filter for that date.
    
    // As per instructions: "If the data array/object for that date is not empty, return { isAvailable: true }"
    // If the API returns a list of available dates:
    let isAvailable = false;
    
    if (Array.isArray(data)) {
        // Assume data is an array of dates or objects containing dates
        const dateMatch = data.find(item => {
            if (typeof item === 'string') return item.includes(targetDate);
            if (item.showDate || item.date) {
                const itemDate = item.showDate || item.date;
                return itemDate.includes(targetDate);
            }
            return false;
        });
        isAvailable = !!dateMatch;
    } else if (typeof data === 'object' && data !== null) {
        // If it's an object containing a list
        const showData = data.data || data.showDates || data.dates || data;
        
        if (Array.isArray(showData)) {
            const dateMatch = showData.find(item => {
                if (typeof item === 'string') return item.includes(targetDate);
                if (item.showDate || item.date) {
                    const itemDate = item.showDate || item.date;
                    return itemDate.includes(targetDate);
                }
                return false;
            });
            isAvailable = !!dateMatch;
        } else {
             // If the API directly returns movies/shows for a specific date? (Although we only passed location)
             // Then if there's any data at all, maybe it's available. But we need to check the date.
             // We'll stringify and see if the date is mentioned as a safety fallback.
             isAvailable = JSON.stringify(showData).includes(targetDate);
        }
    }

    return { isAvailable };

  } catch (error) {
    console.error('Error checking ticket availability:', error);
    return { isAvailable: false };
  }
};
