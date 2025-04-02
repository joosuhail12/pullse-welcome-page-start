
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 
          border-vivid-purple 
          text-vivid-purple 
          hover:bg-vivid-purple 
          hover:text-white 
          hover:border-vivid-purple-600 
          focus:outline-none 
          focus:ring-2 
          focus:ring-vivid-purple-300 
          transition-all 
          duration-300 
          ease-in-out 
          active:scale-95 
          group"
        onClick={handleStartNewChat}
      >
        <MessageSquare 
          className="mr-1.5 
            group-hover:text-white 
            group-hover:scale-105 
            transition-all" 
          size={16} 
        />
        Start a new conversation
      </Button>

