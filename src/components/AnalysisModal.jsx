import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Card, CircularProgress, InputAdornment, CardContent, TextField, IconButton } from '@mui/material';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

const style = {
    position: 'absolute',
    top: '50%',
    left: '57.6%',
    transform: 'translate(-50%, -50%)',
    width: '95%',
    maxWidth: '72%',
    height: '85vh',
    maxHeight: '95vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    py: 4,
    px: 10,
    borderRadius: 2,
    overflowY: 'auto'
};

const StockAnalysisModal = ({ open, handleClose, result }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 20000); // simulate loading
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        if (result) {
            setLoading(false);
        }
    }, [result]);

    const handleSend = () => {
        console.log('User asked:', input);
        setInput('');
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" textAlign="center" p={1} mb={1}>Stock Analysis</Typography>
                <Box sx={{ mb: 2, px: 10 }}>
                    <CardContent>
                        {loading ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                                <CircularProgress color="primary" />
                                <Typography mt={2} fontSize="14pt" fontWeight="bold" sx={{ animation: 'pulse 2s infinite' }}>
                                    Thinking...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography variant="subtitle1" fontSize="14pt" fontWeight="bold">Decision</Typography>
                                <Typography variant="body1" mb={2}>{result?.decision}</Typography>

                                <Typography variant="subtitle1" fontSize="14pt" fontWeight="bold">Technical Analysis</Typography>
                                <Typography variant="body1" mb={2}>{result?.technical_analysis}</Typography>

                                <Typography variant="subtitle1" fontSize="14pt" fontWeight="bold">Fundamental Analysis</Typography>
                                <Typography variant="body1" mb={2}>{result?.fundamental_analysis}</Typography>

                                <Typography variant="subtitle1" fontSize="14pt" fontWeight="bold" mt={6}>Sources</Typography>
                                {result?.news_sources_used?.map((news, idx) => (
                                    <Typography key={idx} variant="body1" mb={1}>
                                        <a href={news.url} target="_blank" rel="noreferrer">
                                            {news.title} <FaExternalLinkAlt size={12} />
                                        </a>
                                    </Typography>
                                ))}

                                <Typography variant="subtitle1" fontSize="12pt" fontWeight="bold" mt={6}>Disclaimer</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    The past performance of a security, an industry, a sector, a market, a financial product, a trading strategy or the individual trade does not guarantee any future results or returns. As an investor, you yourself bear the full responsibility for your individual investment decisions. Such decisions should be based on an assessment of your financial situation, your investment objectives, your risk tolerance and your liquidity needs and should be discussed in advance with your personal financial advisor in case of doubt.
                                </Typography>
                            </>
                        )}
                    </CardContent>
                </Box>

                <Box display="flex" alignItems="center" gap={1} px={10}>
                    <TextField
                        fullWidth
                        placeholder="Ask a follow-up question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiInputBase-root': {
                                borderRadius: '0.5em',
                                paddingRight: '1.3em',
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSend} edge="end" sx={{ p: 0.8 }}>
                                        <IoMdSend color="#000000" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default StockAnalysisModal;
