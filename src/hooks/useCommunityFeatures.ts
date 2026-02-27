import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useRealTimeStations } from "./useRealTimeStation";

export interface Review {
  id: string;
  station_id: string;
  user_id: string;
  rating: number; // 1-5
  title: string;
  content: string;
  photos: string[];
  tags: string[];
  helpful_count: number;
  response?: {
    content: string;
    created_at: string;
    from_station_owner: boolean;
  };
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  user_info: {
    full_name: string;
    avatar_url?: string;
    total_reviews: number;
    average_rating: number;
  };
}

export interface StationTip {
  id: string;
  station_id: string;
  user_id: string;
  content: string;
  category: "parking" | "accessibility" | "amenities" | "pricing" | "timing" | "general";
  helpful_count: number;
  created_at: string;
  user_info: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Question {
  id: string;
  station_id: string;
  user_id: string;
  title: string;
  content: string;
  answers: Answer[];
  views: number;
  created_at: string;
  user_info: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  helpful_count: number;
  is_from_station_owner: boolean;
  created_at: string;
  user_info: {
    full_name: string;
    avatar_url?: string;
    is_station_owner?: boolean;
  };
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  station_id?: string;
  location: string;
  date: string;
  time: string;
  max_attendees: number;
  current_attendees: number;
  organizer_id: string;
  category: "meetup" | "workshop" | "charging_session" | "test_drive" | "community";
  created_at: string;
  organizer_info: {
    full_name: string;
    avatar_url?: string;
  };
  is_attending: boolean;
}

export const useCommunityFeatures = (stationId?: string) => {
  const { user } = useAuth();
  const { stations } = useRealTimeStations();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tips, setTips] = useState<StationTip[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch reviews for a station
  const fetchReviews = useCallback(async (stationId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReviews: Review[] = [
        {
          id: "rev_1",
          station_id: stationId,
          user_id: "user_1",
          rating: 5,
          title: "Excellent charging experience!",
          content: "Fast chargers, clean facility, and great location. The staff was very helpful and the charging process was smooth.",
          photos: ["/mock/charging_station_1.jpg", "/mock/charging_station_2.jpg"],
          tags: ["fast_charging", "clean", "helpful_staff"],
          helpful_count: 12,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          is_verified: true,
          user_info: {
            full_name: "John Doe",
            avatar_url: "/mock/avatar_1.jpg",
            total_reviews: 23,
            average_rating: 4.7,
          },
        },
        {
          id: "rev_2",
          station_id: stationId,
          user_id: "user_2",
          rating: 4,
          title: "Good but could be better",
          content: "Charging works well but the parking spots are a bit tight. The location is convenient though.",
          photos: [],
          tags: ["convenient_location", "tight_parking"],
          helpful_count: 8,
          response: {
            content: "Thank you for your feedback! We're looking into expanding the parking area.",
            created_at: "2024-01-16T14:20:00Z",
            from_station_owner: true,
          },
          created_at: "2024-01-14T15:45:00Z",
          updated_at: "2024-01-16T14:20:00Z",
          is_verified: true,
          user_info: {
            full_name: "Jane Smith",
            avatar_url: "/mock/avatar_2.jpg",
            total_reviews: 15,
            average_rating: 4.2,
          },
        },
      ];
      
      setReviews(mockReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a review
  const addReview = async (
    rating: number,
    title: string,
    content: string,
    photos: string[] = [],
    tags: string[] = []
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !stationId) return { success: false, error: "User not authenticated or station not specified" };

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReview: Review = {
        id: `rev_${Date.now()}`,
        station_id: stationId,
        user_id: user.id,
        rating,
        title,
        content,
        photos,
        tags,
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: false,
        user_info: {
          full_name: user.user_metadata?.full_name || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
          total_reviews: 1,
          average_rating: rating,
        },
      };

      setReviews(prev => [newReview, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to add review" };
    } finally {
      setIsLoading(false);
    }
  };

  // Mark review as helpful
  const markReviewHelpful = async (reviewId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful_count: review.helpful_count + 1 }
          : review
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to mark review as helpful" };
    }
  };

  // Fetch tips for a station
  const fetchTips = useCallback(async (stationId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTips: StationTip[] = [
        {
          id: "tip_1",
          station_id: stationId,
          user_id: "user_3",
          content: "Best to arrive early in the morning (6-8 AM) to avoid crowds. All chargers are usually available.",
          category: "timing",
          helpful_count: 15,
          created_at: "2024-01-10T08:15:00Z",
          user_info: {
            full_name: "Mike Johnson",
            avatar_url: "/mock/avatar_3.jpg",
          },
        },
        {
          id: "tip_2",
          station_id: stationId,
          user_id: "user_4",
          content: "There's a coffee shop next door that's perfect while you wait for your car to charge.",
          category: "amenities",
          helpful_count: 22,
          created_at: "2024-01-08T14:30:00Z",
          user_info: {
            full_name: "Sarah Wilson",
            avatar_url: "/mock/avatar_4.jpg",
          },
        },
      ];
      
      setTips(mockTips);
    } catch (error) {
      console.error("Failed to fetch tips:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a tip
  const addTip = async (
    content: string,
    category: StationTip['category']
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !stationId) return { success: false, error: "User not authenticated or station not specified" };

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newTip: StationTip = {
        id: `tip_${Date.now()}`,
        station_id: stationId,
        user_id: user.id,
        content,
        category,
        helpful_count: 0,
        created_at: new Date().toISOString(),
        user_info: {
          full_name: user.user_metadata?.full_name || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
        },
      };

      setTips(prev => [newTip, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to add tip" };
    }
  };

  // Fetch questions for a station
  const fetchQuestions = useCallback(async (stationId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockQuestions: Question[] = [
        {
          id: "q_1",
          station_id: stationId,
          user_id: "user_5",
          title: "Do they have Tesla adapters available?",
          content: "I drive a Tesla Model 3 and want to know if I need to bring my own adapter or if they provide one.",
          answers: [
            {
              id: "a_1",
              question_id: "q_1",
              user_id: "station_owner",
              content: "Yes, we provide Tesla adapters for free. Just ask at the front desk.",
              helpful_count: 18,
              is_from_station_owner: true,
              created_at: "2024-01-12T09:20:00Z",
              user_info: {
                full_name: "Station Staff",
                avatar_url: "/mock/station_avatar.jpg",
                is_station_owner: true,
              },
            },
          ],
          views: 45,
          created_at: "2024-01-11T16:45:00Z",
          user_info: {
            full_name: "Tom Brown",
            avatar_url: "/mock/avatar_5.jpg",
          },
        },
      ];
      
      setQuestions(mockQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  }, []);

  // Add a question
  const addQuestion = async (
    title: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !stationId) return { success: false, error: "User not authenticated or station not specified" };

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        station_id: stationId,
        user_id: user.id,
        title,
        content,
        answers: [],
        views: 0,
        created_at: new Date().toISOString(),
        user_info: {
          full_name: user.user_metadata?.full_name || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
        },
      };

      setQuestions(prev => [newQuestion, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to add question" };
    }
  };

  // Add an answer
  const addAnswer = async (
    questionId: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAnswer: Answer = {
        id: `a_${Date.now()}`,
        question_id: questionId,
        user_id: user.id,
        content,
        helpful_count: 0,
        is_from_station_owner: false,
        created_at: new Date().toISOString(),
        user_info: {
          full_name: user.user_metadata?.full_name || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
        },
      };

      setQuestions(prev => prev.map(question => 
        question.id === questionId 
          ? { ...question, answers: [...question.answers, newAnswer] }
          : question
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to add answer" };
    }
  };

  // Fetch community events
  const fetchEvents = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const mockEvents: CommunityEvent[] = [
        {
          id: "event_1",
          title: "EV Owners Meetup - Bangalore",
          description: "Join fellow EV owners for a casual meetup. Share experiences, tips, and stories about your electric vehicles.",
          location: "ChargePe Station, MG Road",
          date: "2024-02-15",
          time: "18:00",
          max_attendees: 30,
          current_attendees: 12,
          organizer_id: "user_6",
          category: "meetup",
          created_at: "2024-01-05T10:00:00Z",
          organizer_info: {
            full_name: "EV Community Bangalore",
            avatar_url: "/mock/community_avatar.jpg",
          },
          is_attending: false,
        },
        {
          id: "event_2",
          title: "Charging 101 Workshop",
          description: "Learn the basics of EV charging, different connector types, and best practices for battery health.",
          location: "ChargePe Station, Indiranagar",
          date: "2024-02-20",
          time: "15:00",
          max_attendees: 20,
          current_attendees: 8,
          organizer_id: "station_owner",
          category: "workshop",
          created_at: "2024-01-08T14:30:00Z",
          organizer_info: {
            full_name: "ChargePe Team",
            avatar_url: "/mock/chargepe_avatar.jpg",
          },
          is_attending: false,
        },
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }, []);

  // Join/leave event
  const toggleEventAttendance = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              current_attendees: event.is_attending 
                ? event.current_attendees - 1 
                : event.current_attendees + 1,
              is_attending: !event.is_attending
            }
          : event
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update event attendance" };
    }
  };

  // Calculate station rating from reviews
  const calculateStationRating = useCallback((stationId: string) => {
    const stationReviews = reviews.filter(r => r.station_id === stationId);
    if (stationReviews.length === 0) return 0;
    
    const totalRating = stationReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / stationReviews.length;
  }, [reviews]);

  // Initialize data if stationId is provided
  useEffect(() => {
    if (stationId) {
      fetchReviews(stationId);
      fetchTips(stationId);
      fetchQuestions(stationId);
    }
    fetchEvents();
  }, [stationId, fetchReviews, fetchTips, fetchQuestions, fetchEvents]);

  return {
    reviews,
    tips,
    questions,
    events,
    isLoading,
    addReview,
    markReviewHelpful,
    addTip,
    addQuestion,
    addAnswer,
    toggleEventAttendance,
    calculateStationRating,
    fetchReviews,
    fetchTips,
    fetchQuestions,
    fetchEvents,
  };
};
