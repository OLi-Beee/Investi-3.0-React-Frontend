import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, Box, Typography, CircularProgress, CardContent, 
  TextField, IconButton, InputAdornment, Paper, Divider,
  useTheme, useMediaQuery
} from '@mui/material';
import { IoMdSend } from 'react-icons/io';
import { FaTimes, FaCloudDownloadAlt } from 'react-icons/fa';
import { green, blue, grey, purple, teal } from '@mui/material/colors';
import OpenAI from "openai";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebaseConfig";

const StockAnalysisModal = ({ open, handleClose, result, stock }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const textToStream = useRef('');
    const streamIntervalRef = useRef(null);
    const contentRef = useRef(null);
    const [analysisDate, setAnalysisDate] = useState(null);
    const [isFromCache, setIsFromCache] = useState(false);
    
    // OpenAI client configuration
    const ORG_ID = process.env.REACT_APP_OPENAI_ORG_ID;
    const PROJ_ID = process.env.REACT_APP_OPENAI_PROJECT_ID;
    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
    // const client = new OpenAI({
    //   apiKey: API_KEY,
    //   organization: ORG_ID,
    //   project: PROJ_ID,
    //   dangerouslyAllowBrowser: true
    // });

    const client = new OpenAI({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
    
    // Style object with mobile responsiveness
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : '80%',
        maxWidth: isMobile ? '100%' : '72%',
        height: isMobile ? '90vh' : '80vh',
        maxHeight: '95vh',
        bgcolor: '#121212',
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0, 128, 0, 0.2)',
        borderRadius: isMobile ? 2 : 3,
        overflowY: 'auto',
        border: `2px solid ${green[700]}`,
        backgroundImage: 'linear-gradient(to bottom, #1a1a1a, #0d0d0d)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '1px',
          height: '100%',
          background: `linear-gradient(to bottom, transparent, ${green[900]}, transparent)`,
          opacity: 0.6,
        }
    };

    // Animation keyframes
    const pulseAnimation = {
        '@keyframes pulse': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 }
        }
    };

    // Auto-scroll to bottom as content is streamed
    useEffect(() => {
        if (contentRef.current && streamedText) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [streamedText, conversation]);

    // Streaming function
    const simulateStreaming = (text) => {
        if (!text) return;
        
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
        
        setStreamedText('');
        setStreamComplete(false);
        
        let fixedText = text;
        
        if (fixedText.match(/[^<]span style="color:/g)) {
            fixedText = fixedText.replace(/([^<])(span style="color:)/g, '$1<$2');
        }
        
        if (fixedText.startsWith('span style="color:')) {
            fixedText = '<' + fixedText;
        }
        
        const openSpans = (fixedText.match(/<span/g) || []).length;
        const closeSpans = (fixedText.match(/<\/span>/g) || []).length;
        if (openSpans > closeSpans) {
            for (let i = 0; i < openSpans - closeSpans; i++) {
                fixedText += '</span>';
            }
        }
        
        textToStream.current = fixedText;
        let charIndex = 0;
        
        streamIntervalRef.current = setInterval(() => {
            if (charIndex < textToStream.current.length) {
                setStreamedText(prev => prev + textToStream.current.charAt(charIndex));
                charIndex++;
            } else {
                clearInterval(streamIntervalRef.current);
                setStreamComplete(true);
            }
        }, 10);
    };

    useEffect(() => {
        if (open) {
            setLoading(true);
            setStreamedText('');
            setStreamComplete(false);
            setConversation([]);
        }
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, [open]);

    useEffect(() => {
        if (result && typeof result === 'string') {
            setLoading(false);
            simulateStreaming(result);
            // Store the initial analysis as context with more detailed instructions
            setConversation([
                {
                    role: "system",
                    content: `You are a financial analyst assistant analyzing ${stock}. Use the following context from the previous analysis to maintain consistency and answer follow-up questions thoroughly. Remember key metrics, technical indicators, fundamental data, and your recommendation.`
                },
                {
                    role: "assistant",
                    content: result
                }
            ]);
        } else if (result && result.analysis) {
            setLoading(false);
            simulateStreaming(result.analysis);
            setConversation([
                {
                    role: "system",
                    content: `You are a financial analyst assistant analyzing ${stock}. Use the following context from the previous analysis to maintain consistency and answer follow-up questions thoroughly. Remember key metrics, technical indicators, fundamental data, and your recommendation.`
                },
                {
                    role: "assistant",
                    content: result.analysis
                }
            ]);
        } else if (result) {
            setLoading(false);
            const combinedText = [
                `Decision: ${result.decision || ''}`,
                `Technical Analysis: ${result.technical_analysis || ''}`,
                `Fundamental Analysis: ${result.fundamental_analysis || ''}`
            ].join('\n\n');
            simulateStreaming(combinedText);
            setConversation([
                {
                    role: "system",
                    content: `You are a financial analyst assistant analyzing ${stock}. Use the following context from the previous analysis to maintain consistency and answer follow-up questions thoroughly. Remember key metrics, technical indicators, fundamental data, and your recommendation.`
                },
                {
                    role: "assistant",
                    content: combinedText
                }
            ]);
        }
    }, [result, stock]);

    // Handle sending follow-up questions to OpenAI
    const handleSend = async () => {
        if (!input.trim() || followUpLoading) return;
        
        const userQuestion = input.trim();
        setInput('');
        setFollowUpLoading(true);
        
        // Add user question to conversation history
        const updatedConversation = [
            ...conversation,
            { role: "user", content: userQuestion }
        ];
        
        // Update conversation state
        setConversation(updatedConversation);
        
        // Create follow-up question element
        const followUpQuestion = document.createElement('div');
        followUpQuestion.innerHTML = `
            <div style="margin-top: 20px; margin-bottom: 15px; padding: 10px 15px; 
                 background-color: rgba(0, 0, 0, 0.2); border-radius: 8px; 
                 border-left: 3px solid ${teal[500]};">
                <p style="font-weight: bold; color: ${grey[300]}; margin-bottom: 5px;">Follow-up question:</p>
                <p style="color: ${teal[300]};">${userQuestion}</p>
            </div>
        `;
        contentRef.current.querySelector('div').appendChild(followUpQuestion);
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'follow-up-loading';
        loadingIndicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                <div style="width: 18px; height: 18px; border: 2px solid ${green[500]}; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                <p style="color: ${grey[400]}; font-style: italic;">Processing...</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        contentRef.current.querySelector('div').appendChild(loadingIndicator);
        
        // Scroll to bottom to show loading indicator
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
        
        try {
            // Add context preservation instructions to the first message if not already present
            let messagesWithContext = [...updatedConversation];
            if (messagesWithContext[0].role === "system" && 
                !messagesWithContext[0].content.includes("preserve context")) {
                messagesWithContext[0] = {
                    role: "system",
                    content: messagesWithContext[0].content + 
                        ` Always preserve context from our entire conversation history. For follow-up questions about ${stock}, 
                        refer to specific data points and analysis mentioned earlier. Continue with the same analytical 
                        approach and maintain consistent formatting for your answers.`
                };
            }
            
            // Send to OpenAI API with streaming response
            const stream = await client.chat.completions.create({
                model: "gpt-4o",
                messages: messagesWithContext,
                stream: true,
                temperature: 0.4,  
                max_tokens: 1000,
            });
            
            // Remove loading indicator
            const loadingElement = document.getElementById('follow-up-loading');
            if (loadingElement) loadingElement.remove();
            
            // Create answer container
            const answerContainer = document.createElement('div');
            answerContainer.style.marginBottom = '20px';
            answerContainer.style.padding = '12px 15px';
            answerContainer.style.backgroundColor = 'transparent'; 
            answerContainer.style.borderLeft = `3px solid ${teal[600]}`;
            answerContainer.style.borderRadius = '0';
            answerContainer.style.borderBottom = `1px solid ${green[900]}`;
            answerContainer.style.borderTop = `1px solid ${green[900]}`;
            contentRef.current.querySelector('div').appendChild(answerContainer);
            
            let assistantReply = "";
            
            // Process streaming response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    assistantReply += content;
                    
                    // Update answer container with formatted HTML
                    answerContainer.innerHTML = formatFollowUpResponse(assistantReply);
                    
                    // Scroll to show latest content
                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
            }
            
            // Add assistant response to conversation
            setConversation([
                ...updatedConversation,
                { role: "assistant", content: assistantReply }
            ]);
            
        } catch (error) {
            console.error("Error fetching follow-up response:", error);
            
            // Remove loading indicator
            const loadingElement = document.getElementById('follow-up-loading');
            if (loadingElement) loadingElement.remove();
            
            // Create error message
            const errorContainer = document.createElement('div');
            errorContainer.innerHTML = `
                <div style="margin-bottom: 20px; padding: 10px 15px; background-color: rgba(255, 0, 0, 0.1); border-radius: 8px; border: 1px solid #ff5252;">
                    <p style="color: #ff5252;">Sorry, I encountered an error processing your question. Please try again.</p>
                </div>
            `;
            contentRef.current.querySelector('div').appendChild(errorContainer);
            
        } finally {
            setFollowUpLoading(false);
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    };
    
    // Format follow-up response with the same styling as main analysis
    const formatFollowUpResponse = (text) => {
        // Apply similar styling as the main analysis
        let formattedText = text
            // Headings
            .replace(/#{3}\s*(.*)/g, `<h3 style="color: ${teal[300]}; font-weight: 600; margin-top: 15px; margin-bottom: 10px; font-size: 18px;">$1</h3>`)
            // Bold
            .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
            // Italics
            .replace(/\*(.*?)\*/g, `<em style="color: ${grey[300]};">$1</em>`)
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" style="color: ${green[400]}; text-decoration: none;" target="_blank">$1</a>`)
            // Line breaks
            .replace(/\n/g, '<br>');
            
        return formattedText;
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Add timestamp indicator component
    useEffect(() => {
      if (open && stock) {
        // Check if there's cached data and get its timestamp
        const checkCacheTimestamp = async () => {
          try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `stockAnalyses/${stock.toUpperCase()}`));
            
            if (snapshot.exists()) {
              const cachedData = snapshot.val();
              const timestampDate = new Date(cachedData.timestamp);
              
              // Set a timestamp indicator in the UI
              setAnalysisDate(timestampDate);
              
              // Check freshness
              const now = new Date();
              const diffTime = Math.abs(now - timestampDate);
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              setIsFromCache(diffDays < 3);
            }
          } catch (error) {
            console.error("Error getting cache timestamp:", error);
          }
        };
        
        checkCacheTimestamp();
      }
    }, [open, stock]);

    return (
        <Modal 
            open={open} 
            onClose={handleClose}
            sx={{ backdropFilter: 'blur(5px)' }}
        >
            <Box sx={style}>
                {/* Header with Close Button */}
                <Box 
                    sx={{ 
                        background: `linear-gradient(90deg, ${teal[700]}, ${green[700]})`,
                        borderTopLeftRadius: isMobile ? 8 : 10,
                        borderTopRightRadius: isMobile ? 8 : 10,
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'white', 
                            fontWeight: 600, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            letterSpacing: 1,
                            fontSize: isMobile ? '1.2rem' : '1.5rem'
                        }}
                    >
                        AI Stock Analysis {stock ? `- ${stock.toUpperCase()}` : ''}
                    </Typography>
                    
                    {/* Close Button */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaTimes />
                    </IconButton>
                </Box>

                {/* Content Area with Auto-scroll */}
                <Box 
                    ref={contentRef}
                    sx={{ 
                        mb: 2, 
                        px: { xs: 2, sm: 4 }, 
                        maxHeight: isMobile ? '65vh' : '62vh', 
                        overflowY: 'auto',
                        scrollBehavior: 'smooth'
                    }}
                >
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            bgcolor: 'rgba(20, 30, 20, 0.6)',
                            color: 'white',
                            borderRadius: 2,
                            p: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            border: `1px solid ${green[900]}`,
                        }}
                    >
                        {loading ? (
                            <Box 
                                display="flex" 
                                flexDirection="column" 
                                alignItems="center" 
                                justifyContent="center" 
                                py={8}
                                sx={{ ...pulseAnimation }}
                            >
                                <CircularProgress 
                                    size={60}
                                    sx={{ 
                                        color: green[400],
                                        animation: 'pulse 2s infinite',
                                        '& .MuiCircularProgress-circle': {
                                            strokeLinecap: 'round',
                                        }
                                    }} 
                                />
                                <Typography 
                                    mt={3} 
                                    fontSize="14pt" 
                                    fontWeight="bold" 
                                    sx={{ 
                                        animation: 'pulse 2s infinite',
                                        color: green[300],
                                        textShadow: '0 0 10px rgba(0,255,0,0.2)'
                                    }}
                                >
                                    Analyzing market data...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box 
                                    sx={{ 
                                        fontSize: '15px',
                                        lineHeight: 1.7,
                                        letterSpacing: 0.3,
                                        '& h3': { 
                                            marginTop: '20px', 
                                            marginBottom: '12px', 
                                            fontSize: '18px',
                                            color: teal[300],
                                            fontWeight: 600
                                        },
                                        '& p': { 
                                            marginBottom: '14px',
                                            color: grey[100]
                                        },
                                        '& a': { 
                                            color: green[400],
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease'
                                        },
                                        '& a:hover': { 
                                            textDecoration: 'underline',
                                            color: teal[300],
                                            transform: 'translateX(2px)',
                                        },
                                        '& img': { 
                                            maxHeight: '16px', 
                                            verticalAlign: 'middle',
                                            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                        },
                                        '& span[style*="color: #22c55e"]': { 
                                            color: `${green[400]} !important`,
                                            textShadow: '0 0 10px rgba(0,255,0,0.3)',
                                            fontWeight: '700 !important'
                                        },
                                        '& span[style*="color: #ef4444"]': { 
                                            color: '#ff5252 !important',
                                            textShadow: '0 0 10px rgba(255,0,0,0.3)',
                                            fontWeight: '700 !important'
                                        },
                                        // Integrated news section
                                        '& .sources-container, & div[style*="margin-top: 20px"]': {
                                            marginTop: '25px'
                                        },
                                        '& a div': { 
                                            transition: 'transform 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-3px)'
                                            }
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: "<"+ streamedText }}
                                />
                                
                                {streamComplete && (
                                    <>
                                        <Divider sx={{ my: 3, bgcolor: green[900], opacity: 0.7 }} />
                                        
                                        {/* Analysis timestamp indicator */}
                                        <Box 
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                            opacity: 0.8
                                          }}
                                        >
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              color: grey[400],
                                              fontSize: '0.75rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.5
                                            }}
                                          >
                                            {isFromCache && <FaCloudDownloadAlt size={12} color={teal[400]} />}
                                            {isFromCache ? 'Globally cached analysis' : 'Fresh analysis'}
                                          </Typography>
                                          
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              color: grey[500],
                                              fontSize: '0.7rem',
                                              fontStyle: 'italic'
                                            }}
                                          >
                                            Analysis as of: {analysisDate ? analysisDate.toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }) : new Date().toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric'
                                            })}
                                          </Typography>
                                        </Box>
                                        
                                        <Divider sx={{ my: 3, bgcolor: green[900], opacity: 0.7 }} />
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: grey[500], 
                                                fontStyle: 'italic',
                                                fontSize: '11px',
                                                display: 'block',
                                                background: 'rgba(0,30,0,0.2)',
                                                p: 1.5,
                                                borderRadius: 1,
                                                border: `1px solid ${green[900]}`
                                            }}
                                        >
                                            Disclaimer: The past performance of a security, an industry, a sector, a market, a financial product, a trading strategy or the individual trade does not guarantee any future results or returns. As an investor, you yourself bear the full responsibility for your individual investment decisions.
                                        </Typography>
                                    </>
                                )}
                            </>
                        )}
                    </Paper>
                </Box>

                {/* Input Area for Follow-up Questions */}
                {streamComplete && (
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={1} 
                        px={isMobile ? 2 : 4}
                        position="sticky"
                        bottom={10}
                        mt={isMobile ? 2 : 3}
                    >
                        <TextField
                            fullWidth
                            placeholder="Ask a follow-up question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            size="small"
                            variant="outlined"
                            disabled={followUpLoading}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '10px',
                                    paddingRight: '1.3em',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 30, 0, 0.2)',
                                    backdropFilter: 'blur(4px)',
                                    height: isMobile ? '44px' : '48px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: grey[800],
                                    transition: 'all 0.2s'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: blue[700],
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: green[700],
                                    borderWidth: 2
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: grey[500],
                                    opacity: 1,
                                    fontStyle: 'italic'
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={handleSend} 
                                            edge="end"
                                            disabled={followUpLoading || !input.trim()}
                                            sx={{ 
                                                p: 1.2, 
                                                color: followUpLoading ? grey[600] : green[400],
                                                bgcolor: 'rgba(0,0,0,0.2)',
                                                '&:hover': {
                                                    bgcolor: followUpLoading ? 'rgba(0,0,0,0.2)' : 'rgba(0,100,0,0.3)',
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {followUpLoading ? (
                                                <CircularProgress size={16} sx={{ color: grey[500] }} />
                                            ) : (
                                                <IoMdSend />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default StockAnalysisModal;
